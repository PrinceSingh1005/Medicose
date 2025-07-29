import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import Message from '../components/Message';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from '../api/axios';

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_SERVER_URL = API_URL ? API_URL.replace('/api', '') : '';

function VideoCallPage() {
  const { appointmentId } = useParams();
  const { userInfo } = useSelector((state) => state.auth);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  const [callStatus, setCallStatus] = useState('connecting');
  const [errorMessage, setErrorMessage] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [apptLoading, setApptLoading] = useState(true);
  const [apptError, setApptError] = useState(null);

  const ICE_SERVERS = React.useMemo(() => ({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  }), []);

  const initializeCall = async () => {
    try {
      socketRef.current = io(SOCKET_SERVER_URL);
      socketRef.current.emit('join_room', appointmentId);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setCallStatus('connected');
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('candidate', {
            candidate: event.candidate,
            roomId: appointmentId,
          });
        }
      };

      socketRef.current.on('offer', async (offer) => {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.emit('answer', {
          answer: pc.localDescription,
          roomId: appointmentId,
        });
      });

      socketRef.current.on('answer', async (answer) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socketRef.current.on('candidate', async (candidate) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding received ICE candidate', e);
        }
      });

      socketRef.current.on('room_full', () => {
        setErrorMessage('Room is full. Only two participants allowed.');
        setCallStatus('error');
        if(pc) pc.close();
        if(socketRef.current) socketRef.current.disconnect();
      });

      socketRef.current.on('peer_joined', async () => {
        // The user with the 'doctor' role will create and send the offer
        if (userInfo.role === 'doctor') {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current.emit('offer', {
            offer: pc.localDescription,
            roomId: appointmentId,
          });
        }
      });

      socketRef.current.on('peer_left', () => {
        setCallStatus('ended');
        setErrorMessage('The other participant has left the call.');
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        if (peerConnectionRef.current) peerConnectionRef.current.close();
      });

    } catch (err) {
      console.error('Failed to get local stream or initialize WebRTC:', err);
      setErrorMessage('Failed to start video call. Please check your camera/microphone permissions.');
      setCallStatus('error');
    }
  };

  useEffect(() => {
    if (!userInfo) {
      setErrorMessage('You must be logged in to access video calls.');
      setCallStatus('error');
      setApptLoading(false);
      return;
    }

    const fetchApptDetails = async () => {
      try {
        // --- CORRECTED API CALL ---
        // Fetch the specific appointment by its ID.
        // This new endpoint is accessible to both the patient and the doctor on the appointment.
        const { data: appt } = await axios.get(`/appointments/${appointmentId}`);

        // The backend now handles authorization, but we can keep this as a fallback.
        const isPatient = userInfo.role === 'patient' && appt.patient._id === userInfo._id;
        const isDoctor = userInfo.role === 'doctor' && appt.doctor._id === userInfo._id;

        if (!isPatient && !isDoctor) {
          setErrorMessage('You are not authorized to join this call.');
          setCallStatus('error');
          setApptLoading(false);
          return;
        }

        setAppointmentDetails(appt);
        initializeCall();

      } catch (err) {
        setApptError(err.response?.data?.message || err.message);
        setCallStatus('error');
      } finally {
        setApptLoading(false);
      }
    };

    fetchApptDetails();

    // Cleanup function
    return () => {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [appointmentId, userInfo]); // Dependencies are correct

  if (apptLoading) {
    return <LoadingSpinner />;
  }

  if (apptError || errorMessage) {
    return <Message variant="danger">{apptError || errorMessage}</Message>;
  }

  return (
    <div className="video-call-container p-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Video Call</h1>
        {appointmentDetails && (
          <p className="mb-4 text-gray-600">
            Appointment with <strong>Dr. {appointmentDetails.doctor.name}</strong> and <strong>{appointmentDetails.patient.name}</strong>
          </p>
        )}

        <div className="video-streams grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="video-wrapper bg-black rounded-lg shadow-lg overflow-hidden relative h-96">
            <h2 className="absolute top-2 left-2 text-sm font-semibold text-white bg-black bg-opacity-50 px-2 py-1 rounded">
              {appointmentDetails?.doctor?.name} (Remote)
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

        {callStatus === 'ended' && (
          <Message type="info">The call has ended.</Message>
        )}
      </div>
    </div>
  );
}

export default VideoCallPage;
