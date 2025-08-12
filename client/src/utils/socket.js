import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_APP_API_URL, {
    withCredentials: true,
    autoConnect: false
});

export const connectSocket = (userId) => {
    if (!socket.connected) {
        socket.connect();
        socket.emit('user:subscribe', userId);
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

export const onAppointmentUpdated = (callback) => {
    socket.on('appointment:updated', callback);
};

export const offAppointmentUpdated = () => {
    socket.off('appointment:updated');
};

export default socket;