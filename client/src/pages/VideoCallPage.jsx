// VideoCallPage.jsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import Message from '../components/Message';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from '../api/axios';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

function VideoCallPage() {
    const { appointmentId } = useParams();
    const { userInfo } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const remoteVideoRef = useRef(null);
    const peerConnections = useRef(new Map());
    const socketRef = useRef(null);

    const [localStream, setLocalStream] = useState(null);
    const localStreamRef = useRef(null);

    const [callStatus, setCallStatus] = useState('initializing');
    const [errorMessage, setErrorMessage] = useState(null);
    const [joinRequests, setJoinRequests] = useState([]);
    const [apptLoading, setApptLoading] = useState(true);
    const [appointmentDetails, setAppointmentDetails] = useState(null);

    const ICE_SERVERS = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    };

    const localVideoRef = useCallback((node) => {
        if (node && localStream) {
            node.srcObject = localStream;
        }
    }, [localStream]);

    const createPeerConnection = useCallback((peerSocketId) => {
        try {
            const pc = new RTCPeerConnection(ICE_SERVERS);

            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => {
                    pc.addTrack(track, localStreamRef.current);
                });
            }

            pc.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    setCallStatus('active');
                }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate && socketRef.current) {
                    socketRef.current.emit('webrtc:ice-candidate', {
                        candidate: event.candidate, toSocketId: peerSocketId,
                    });
                }
            };

            peerConnections.current.set(peerSocketId, pc);
            return pc;
        } catch (error) {
            console.error("Failed to create peer connection:", error);
        }
    }, []);

    const handleAdmitPatient = (patientSocketId) => {
        socketRef.current.emit('doctor:admit_patient', { patientSocketId, appointmentId });
        setJoinRequests(reqs => reqs.filter(req => req.patientSocketId !== patientSocketId));
    };

    // Function to handle leaving the meeting
    const handleLeaveMeeting = () => {
        if (socketRef.current) {
            socketRef.current.emit('meeting:leave', { appointmentId });
        }
        // Redirect to dashboard
        navigate(userInfo.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    };

    useEffect(() => {
        const setupSocketListeners = (socket) => {
            socket.on('connect_error', (err) => { console.error('[Socket Error]', err); setErrorMessage('Cannot connect to video service.'); setCallStatus('error'); });
            socket.on('patient:join_request_received', ({ patientInfo, patientSocketId }) => { setJoinRequests(prev => prev.some(req => req.patientSocketId === patientSocketId) ? prev : [...prev, { patientInfo, patientSocketId }]); });

            socket.on('patient:ready_for_connection', async ({ patientSocketId }) => { const pc = createPeerConnection(patientSocketId); if (pc) { const offer = await pc.createOffer(); await pc.setLocalDescription(offer); socket.emit('webrtc:offer', { offer, toSocketId: patientSocketId }); } });

            socket.on('patient:admitted', () => { setCallStatus('connecting'); });
            socket.on('webrtc:offer', async ({ offer, fromSocketId }) => { const pc = createPeerConnection(fromSocketId); if (pc) { await pc.setRemoteDescription(new RTCSessionDescription(offer)); const answer = await pc.createAnswer(); await pc.setLocalDescription(answer); socket.emit('webrtc:answer', { answer, toSocketId: fromSocketId }); } });
            socket.on('webrtc:answer', async ({ answer, fromSocketId }) => { const pc = peerConnections.current.get(fromSocketId); if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer)); });
            socket.on('webrtc:ice-candidate', async ({ candidate, fromSocketId }) => { const pc = peerConnections.current.get(fromSocketId); if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate)); });

            socket.on('peer:left', ({ socketId }) => {
                setErrorMessage('Participant disconnected. Waiting for reconnect...');
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
                const pc = peerConnections.current.get(socketId);
                if (pc) pc.close();
                peerConnections.current.delete(socketId);
            });

            socket.on('meeting:has_ended', () => {
                setErrorMessage('The other participant has ended the meeting.');
                setCallStatus('ended');
                if (socketRef.current) socketRef.current.disconnect();
            });
        };

        const initialize = async () => {
            if (!SOCKET_SERVER_URL) { setErrorMessage("Configuration error: Socket URL not set."); setCallStatus('error'); setApptLoading(false); return; }
            try {

                 // 1. Fetch appointment details, including the new `meetingStatus`
                const { data: appt } = await axios.get(`/appointments/${appointmentId}`);
                setAppointmentDetails(appt);

                // 2. Check if the meeting has already ended
                // if (appt.meetingStatus === 'ended') {
                //     setErrorMessage("This meeting has already ended.");
                //     setCallStatus('ended');
                //     setApptLoading(false);
                //     return; // Stop initialization
                // }
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                localStreamRef.current = stream;
                
                const isPatient = userInfo.role === 'patient' && appt.patient._id === userInfo._id;
                const isDoctor = userInfo.role === 'doctor' && appt.doctor._id === userInfo._id;

                if (!isPatient && !isDoctor) throw new Error('Not authorized for this call.');

                socketRef.current = io(SOCKET_SERVER_URL);
                const socket = socketRef.current;

                setupSocketListeners(socket);

                socket.on('connect', () => {
                    if (isDoctor) {
                        socket.emit('doctor:join_room', { appointmentId });
                        setCallStatus('waiting for patient');
                    } else {
                        socket.emit('patient:request_join', { appointmentId, patientInfo: { name: userInfo.name } });
                        setCallStatus('requesting to join');
                    }
                });

            } catch (err) {
                setErrorMessage(err.response?.data?.message || err.message);
                setCallStatus('error');
            } finally {
                setApptLoading(false);
            }
        };

        if (userInfo) {
            initialize();
        }

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
        // ** THE FIX IS HERE: `localStream` has been removed from this array to break the loop. **
    }, [appointmentId, userInfo, createPeerConnection]);

    if (apptLoading) return <LoadingSpinner />;
    if (errorMessage && callStatus === 'error') return <Message variant="danger">{errorMessage}</Message>;

    
    if (callStatus === 'ended') {
        return (
            <div className="text-center p-10">
                <Message variant="info">{errorMessage || "The meeting has ended."}</Message>
                <button onClick={() => navigate(userInfo.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')} className="btn-primary mt-4">
                    Back to Dashboard
                </button>
            </div>
        );
    }
    
    const isDoctor = userInfo.role === 'doctor';
    const remoteUserName = isDoctor ? appointmentDetails?.patient?.name : `Dr. ${appointmentDetails?.doctor?.name}`;

    return (
        <div className="video-call-container p-4 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Video Consultation</h1>

                {isDoctor && joinRequests.length > 0 && (
                    <div className="waiting-room p-4 mb-4 border rounded-lg bg-white shadow">
                        <h3 className="font-bold text-lg">Waiting Room</h3>
                        {joinRequests.map(({ patientInfo, patientSocketId }) => (
                            <div key={patientSocketId} className="flex justify-between items-center mt-2 p-2 bg-gray-100 rounded">
                                <p><strong>{patientInfo.name}</strong> is waiting to join.</p>
                                <button onClick={() => handleAdmitPatient(patientSocketId)} className="btn-primary">Admit</button>
                            </div>
                        ))}
                    </div>
                )}

                {!isDoctor && (callStatus === 'requesting to join' || callStatus === 'connecting') && (
                    <div className="text-center p-4 mb-4 border rounded-lg bg-blue-50 text-blue-800">
                        <p className="font-semibold">Waiting for the doctor to admit you...</p>
                    </div>
                )}

                <div className="video-streams grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="video-wrapper bg-black rounded-lg shadow-lg overflow-hidden relative h-96">
                        <h2 className="absolute top-2 left-2 text-sm font-semibold text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                            {remoteUserName || 'Remote User'}
                        </h2>
                        <video ref={remoteVideoRef} autoPlay className="w-full h-full object-cover"></video>
                    </div>
                    <div className="video-wrapper bg-black rounded-lg shadow-lg overflow-hidden relative h-96">
                        <h2 className="absolute top-2 left-2 text-sm font-semibold text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                            {userInfo.name} (You)
                        </h2>
                        <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover"></video>
                    </div>
                </div>

                <div className="call-status mt-4 text-center p-3 bg-white rounded-lg shadow">
                    <p className="text-lg font-medium text-gray-700">
                        Call Status: <strong className="capitalize">{callStatus}</strong>
                    </p>
                </div>
            </div>
            <div className="call-controls mt-4 text-center">
                 <button onClick={handleLeaveMeeting} className="btn-danger">
                    Leave Meeting
                </button>
            </div>
        </div>
    );
}

export default VideoCallPage;