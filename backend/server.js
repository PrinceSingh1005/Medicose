// Import necessary modules
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

// Initialize Express app and create an HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io server with CORS configuration
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Your frontend URL
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Import and use API routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('MediCose API is running...');
});

// --- Socket.IO Connection Handling with Waiting Room ---
io.on('connection', (socket) => {
    console.log(`✅ [Connect] User connected: ${socket.id}`);

    // Event for the DOCTOR to create and join the meeting room
    socket.on('doctor:join_room', ({ appointmentId }) => {
        socket.join(appointmentId);
        socket.data.roomId = appointmentId; // Store room ID on the socket object for later use
        console.log(`👨‍⚕️ [Doctor Joined] Doctor ${socket.id} created and joined room: ${appointmentId}`);
    });

    // Event for the PATIENT to request entry into the meeting
    socket.on('patient:request_join', ({ appointmentId, patientInfo }) => {
        console.log(`⏳ [Patient Request] Patient ${patientInfo.name} (${socket.id}) is requesting to join room ${appointmentId}`);
        // Forward this request to the doctor in that specific room.
        console.log(`    -> Forwarding request to room: ${appointmentId}`);
        socket.to(appointmentId).emit('patient:join_request_received', {
            patientInfo,
            patientSocketId: socket.id
        });
    });

    // Event for the DOCTOR to admit the patient
    socket.on('doctor:admit_patient', ({ patientSocketId, appointmentId }) => {
        console.log(`👍 [Patient Admitted] Doctor admitting patient ${patientSocketId}`);
        
        const patientSocket = io.sockets.sockets.get(patientSocketId);
        if (patientSocket) {
            patientSocket.join(appointmentId);
            patientSocket.data.roomId = appointmentId;

            // 1. Notify the PATIENT they are admitted and can proceed
            io.to(patientSocketId).emit('patient:admitted', { appointmentId });
            console.log(`    -> Notified patient ${patientSocketId} they are admitted.`);

            // 2. Notify the DOCTOR the patient is ready for the WebRTC connection
            socket.emit('patient:ready_for_connection', { patientSocketId });
            console.log(`    -> Notified doctor ${socket.id} that patient is ready for WebRTC.`);
        } else {
             console.log(`    -> ❌ ERROR: Could not find patient socket ${patientSocketId} to admit.`);
        }
    });

    // --- WebRTC Signaling Events ---
    // These must be targeted to specific socket IDs to ensure they reach the correct peer.

    socket.on('webrtc:offer', ({ offer, toSocketId }) => {
        console.log(`➡️ [WebRTC Offer] Sending from ${socket.id} to ${toSocketId}`);
        io.to(toSocketId).emit('webrtc:offer', { offer, fromSocketId: socket.id });
    });

    socket.on('webrtc:answer', ({ answer, toSocketId }) => {
        console.log(`⬅️ [WebRTC Answer] Sending from ${socket.id} to ${toSocketId}`);
        io.to(toSocketId).emit('webrtc:answer', { answer, fromSocketId: socket.id });
    });

    socket.on('webrtc:ice-candidate', ({ candidate, toSocketId }) => {
        // This is very noisy, so we don't log it by default.
        io.to(toSocketId).emit('webrtc:ice-candidate', { candidate, fromSocketId: socket.id });
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log(`❌ [Disconnect] User disconnected: ${socket.id}`);
        const roomId = socket.data.roomId;
        if (roomId) {
            // Notify everyone else in the room that a peer has left
            socket.to(roomId).emit('peer:left', { socketId: socket.id });
            console.log(`👋 [Peer Left] Notification sent for room: ${roomId}`);
        }
    });
});

// Get port from environment variables or use default
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));