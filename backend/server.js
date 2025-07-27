// Import necessary modules
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const http = require('http'); // Import http for Socket.io
const { Server } = require('socket.io'); // Import Server from socket.io

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

// Initialize Express app
const app = express();
const server = http.createServer(app); // Create HTTP server from Express app

// Initialize Socket.io server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Allow your frontend origin
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

    // Example: Join a room for video calls or notifications
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // Example: Send a message to a specific room
    socket.on('send_notification', (data) => {
        io.to(data.roomId).emit('receive_notification', data.message);
        console.log(`Notification sent to room ${data.roomId}: ${data.message}`);
    });

    // WebRTC signaling (simplified)
    socket.on('offer', (data) => {
        // Forward offer to the other peer in the room
        socket.to(data.roomId).emit('offer', data.offer);
    });

    socket.on('answer', (data) => {
        // Forward answer to the other peer in the room
        socket.to(data.roomId).emit('answer', data.answer);
    });

    socket.on('candidate', (data) => {
        // Forward ICE candidate to the other peer in the room
        socket.to(data.roomId).emit('candidate', data.candidate);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Get port from environment variables or use default
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
