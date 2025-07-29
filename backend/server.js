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

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow your frontend origin
        methods: ["GET", "POST"]
    }
});

// Middleware to enable CORS for all origins
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Define API routes
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

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Store the room a socket is in
    let currentRoomId = null;

    socket.on('join_room', (roomId) => {
        currentRoomId = roomId;
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);

        // Get all sockets in the room
        const clientsInRoom = io.sockets.adapter.rooms.get(roomId);
        const numClients = clientsInRoom ? clientsInRoom.size : 0;
        console.log(`Number of clients in room ${roomId}: ${numClients}`);

        // If there's already one client in the room (meaning this is the second client joining)
        if (numClients === 2) {
            // Emit 'peer_joined' to the *other* client in the room
            socket.to(roomId).emit('peer_joined');
            // Also, emit to the newly joined client that another peer is present
            // This can trigger an offer from the new client if needed, or simply confirm presence
            socket.emit('peer_present'); // A new event for the joining client
            console.log(`Peer joined notification sent in room: ${roomId}`);
        } else if (numClients > 2) {
            // Optionally handle more than 2 clients if your app supports it, or reject
            socket.emit('room_full');
            console.log(`Room ${roomId} is full. Disconnecting ${socket.id}`);
            socket.leave(roomId); // Or disconnect
        }
    });

    // WebRTC signaling
    socket.on('offer', (data) => {
        // Forward offer to the other peer in the room
        socket.to(data.roomId).emit('offer', data.offer);
        console.log(`Offer sent in room ${data.roomId} by ${socket.id}`);
    });

    socket.on('answer', (data) => {
        // Forward answer to the other peer in the room
        socket.to(data.roomId).emit('answer', data.answer);
        console.log(`Answer sent in room ${data.roomId} by ${socket.id}`);
    });

    socket.on('candidate', (data) => {
        // Forward ICE candidate to the other peer in the room
        socket.to(data.roomId).emit('candidate', data.candidate);
        console.log(`Candidate sent in room ${data.roomId} by ${socket.id}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (currentRoomId) {
            // Notify the other peer in the room that this user has left
            socket.to(currentRoomId).emit('peer_left');
            console.log(`Peer left notification sent for room: ${currentRoomId}`);
        }
    });
});

// Get port from environment variables or use default
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
