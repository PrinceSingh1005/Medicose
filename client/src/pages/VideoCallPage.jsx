// VideoCallPage.jsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import Message from '../components/Message';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from '../api/axios';

// Ensure the URL is correct for your environment
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL;
console.log(SOCKET_SERVER_URL);

function VideoCallPage() {
    const { appointmentId } = useParams();
    const { userInfo } = useSelector((state) => state.auth);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnections = useRef(new Map());
    const socketRef = useRef(null);
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

    const createPeerConnection = useCallback((peerSocketId) => {
        try {
            console.log(`[WebRTC] Creating peer connection for ${peerSocketId}`);
            const pc = new RTCPeerConnection(ICE_SERVERS);

            // Add local stream tracks to the new connection
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => {
                    pc.addTrack(track, localStreamRef.current);
                });
            }

            // Handle incoming remote stream
            pc.ontrack = (event) => {
                console.log(`[WebRTC] Received remote track from ${peerSocketId}`);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    setCallStatus('active');
                }
            };

            // Handle ICE candidate exchange
            pc.onicecandidate = (event) => {
                if (event.candidate && socketRef.current) {
                    socketRef.current.emit('webrtc:ice-candidate', {
                        candidate: event.candidate,
                        toSocketId: peerSocketId,
                    });
                }
            };
            
            peerConnections.current.set(peerSocketId, pc);
            return pc;
        } catch (error) {
            console.error("Failed to create peer connection:", error);
            setErrorMessage("Failed to create video connection.");
        }
    }, []);

    const handleAdmitPatient = (patientSocketId) => {
        console.log(`[UI] Doctor admitting patient: ${patientSocketId}`);
        socketRef.current.emit('doctor:admit_patient', { patientSocketId, appointmentId });
        setJoinRequests(reqs => reqs.filter(req => req.patientSocketId !== patientSocketId));
    };

    useEffect(() => {
        // This function will set up all socket event listeners.
        // It's defined separately to ensure listeners are attached immediately after socket creation.
        const setupSocketListeners = (socket) => {
            socket.on('connect_error', (err) => {
                console.error('[Socket Error]', err);
                setErrorMessage('Cannot connect to the video service.');
                setCallStatus('error');
            });

            // Doctor receives a request from a patient
            socket.on('patient:join_request_received', ({ patientInfo, patientSocketId }) => {
                console.log(`[Socket] Received join request from:`, patientInfo);
                // Avoid adding duplicate requests
                setJoinRequests(prev => prev.some(req => req.patientSocketId === patientSocketId) ? prev : [...prev, { patientInfo, patientSocketId }]);
            });

            // Doctor is notified that the admitted patient is ready for WebRTC
            socket.on('patient:ready_for_connection', async ({ patientSocketId }) => {
                console.log(`[Socket] Patient ${patientSocketId} is ready. Doctor creating offer...`);
                const pc = createPeerConnection(patientSocketId);
                if (pc) {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit('webrtc:offer', { offer, toSocketId: patientSocketId });
                }
            });

            // Patient is notified they have been admitted
            socket.on('patient:admitted', () => {
                console.log('[Socket] You have been admitted by the doctor. Waiting for connection...');
                setCallStatus('connecting');
            });

            // --- Common WebRTC Listeners ---
            socket.on('webrtc:offer', async ({ offer, fromSocketId }) => {
                console.log(`[WebRTC] Received offer from ${fromSocketId}`);
                const pc = createPeerConnection(fromSocketId);
                if (pc) {
                    await pc.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit('webrtc:answer', { answer, toSocketId: fromSocketId });
                }
            });

            socket.on('webrtc:answer', async ({ answer, fromSocketId }) => {
                console.log(`[WebRTC] Received answer from ${fromSocketId}`);
                const pc = peerConnections.current.get(fromSocketId);
                if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
            });

            socket.on('webrtc:ice-candidate', async ({ candidate, fromSocketId }) => {
                const pc = peerConnections.current.get(fromSocketId);
                if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
            });

            socket.on('peer:left', ({ socketId }) => {
                setErrorMessage('The other participant has left.');
                setCallStatus('ended');
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
                const pc = peerConnections.current.get(socketId);
                if (pc) pc.close();
                peerConnections.current.delete(socketId);
            });
        };
        
        // Main setup logic
        const initialize = async () => {
            try {
                // 1. Get user media first to check permissions
                console.log('[Init] Getting user media...');
                localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
                console.log('[Init] Media stream acquired.');

                // 2. Fetch appointment details to authorize
                console.log('[Init] Fetching appointment details...');
                const { data: appt } = await axios.get(`/appointments/${appointmentId}`);
                setAppointmentDetails(appt);
                const isPatient = userInfo.role === 'patient' && appt.patient._id === userInfo._id;
                const isDoctor = userInfo.role === 'doctor' && appt.doctor._id === userInfo._id;

                if (!isPatient && !isDoctor) throw new Error('You are not authorized for this call.');

                // 3. Connect to the socket server
                console.log(`[Init] Connecting to socket server: ${SOCKET_SERVER_URL}`);
                socketRef.current = io(SOCKET_SERVER_URL);
                const socket = socketRef.current;
                
                // 4. Set up all listeners immediately
                setupSocketListeners(socket);
                
                // 5. Once connected, join the appropriate room
                socket.on('connect', () => {
                    console.log(`[Socket] Connected with ID: ${socket.id}`);
                    if (isDoctor) {
                        console.log('[Socket] Emitting doctor:join_room');
                        socket.emit('doctor:join_room', { appointmentId });
                        setCallStatus('waiting for patient');
                    } else {
                        console.log('[Socket] Emitting patient:request_join');
                        socket.emit('patient:request_join', { appointmentId, patientInfo: { name: userInfo.name } });
                        setCallStatus('requesting to join');
                    }
                });

            } catch (err) {
                console.error('[Init] Initialization failed:', err);
                setErrorMessage(err.response?.data?.message || err.message || 'An error occurred during setup.');
                setCallStatus('error');
            } finally {
                setApptLoading(false);
            }
        };

        if (userInfo) {
            initialize();
        }

        // Cleanup function
        return () => {
            console.log('[Cleanup] Unmounting component...');
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            peerConnections.current.forEach(pc => pc.close());
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [appointmentId, userInfo, createPeerConnection]);

    // --- Render Logic ---
    if (apptLoading) return <LoadingSpinner />;
    if (errorMessage && callStatus === 'error') return <Message variant="danger">{errorMessage}</Message>;

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
                        {errorMessage && callStatus !== 'error' && <span className="text-red-500 ml-2">{errorMessage}</span>}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default VideoCallPage;