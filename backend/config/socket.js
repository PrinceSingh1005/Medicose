const socketIO = require('socket.io');
const Appointment = require('../models/Appointment');

let io;

const initSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        },
        pingTimeout: 60000
    });

    io.on('connection', (socket) => {
        console.log(`✅ [Connect] User connected: ${socket.id}`);

        // User subscriptions
        socket.on('user:subscribe', (userId) => {
            socket.join(`user-${userId}`);
            console.log(`👤 [User Subscribed] User ${userId} subscribed to notifications`);
        });

        // Doctor creates/joins appointment room
        socket.on('doctor:join_room', async ({ appointmentId }) => {
            await Appointment.findByIdAndUpdate(appointmentId, { meetingStatus: 'active' });
            socket.join(appointmentId);
            socket.data.roomId = appointmentId;
            console.log(`👨‍⚕️ [Doctor Joined] Doctor ${socket.id} joined room: ${appointmentId}`);
        });

        // Patient requests to join appointment
        socket.on('patient:request_join', ({ appointmentId, patientInfo }) => {
            console.log(`⏳ [Patient Request] Patient ${patientInfo.name} requesting to join room ${appointmentId}`);
            socket.to(appointmentId).emit('patient:join_request_received', {
                patientInfo,
                patientSocketId: socket.id
            });
        });

        // Doctor admits patient
        socket.on('doctor:admit_patient', ({ patientSocketId, appointmentId }) => {
            console.log(`👍 [Patient Admitted] Admitting patient ${patientSocketId}`);
            const patientSocket = io.sockets.sockets.get(patientSocketId);
            if (patientSocket) {
                patientSocket.join(appointmentId);
                patientSocket.data.roomId = appointmentId;
                io.to(patientSocketId).emit('patient:admitted', { appointmentId });
                socket.emit('patient:ready_for_connection', { patientSocketId });
            }
        });

        // WebRTC Signaling
        socket.on('webrtc:offer', ({ offer, toSocketId }) => {
            io.to(toSocketId).emit('webrtc:offer', { offer, fromSocketId: socket.id });
        });

        socket.on('webrtc:answer', ({ answer, toSocketId }) => {
            io.to(toSocketId).emit('webrtc:answer', { answer, fromSocketId: socket.id });
        });

        socket.on('webrtc:ice-candidate', ({ candidate, toSocketId }) => {
            io.to(toSocketId).emit('webrtc:ice-candidate', { candidate, fromSocketId: socket.id });
        });

        // End meeting
        socket.on('meeting:end', async ({ appointmentId }) => {
            await Appointment.findByIdAndUpdate(appointmentId, { meetingStatus: 'ended' });
            io.to(appointmentId).emit('meeting:ended');
            console.log(`🛑 [Meeting Ended] Room ${appointmentId}`);
        });

        // Disconnection handler
        socket.on('disconnect', () => {
            console.log(`❌ [Disconnect] User disconnected: ${socket.id}`);
            if (socket.data.roomId) {
                socket.to(socket.data.roomId).emit('peer:disconnected', { socketId: socket.id });
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

const emitToUser = (userId, event, data) => {
    if (!io) return;
    io.to(`user-${userId}`).emit(event, data);
};

module.exports = {
    initSocket,
    getIO,
    emitToUser
};