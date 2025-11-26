import { useAuthStore } from "@/domains/auth/store/auth.store";
import { io, Socket } from "socket.io-client";


const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

console.log('SOCKET_URL', SOCKET_URL);
let socket: Socket | null = null;
export const connectSocket = () => {
    const { accessToken } = useAuthStore.getState();
    if(accessToken && !socket) {
        socket = io(
            SOCKET_URL,
            {
                auth: {
                    token: accessToken
                },
                extraHeaders: {
                    Authorization: `Bearer ${accessToken}`
                },
                transports: ['websocket'],
                autoConnect: true,
                path: '/notifications'
            }
        );

        socket.on('connect', () => {
            console.log('Connected to socket');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket');
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connect error:', error);
        });
    }

    return socket;
}

export const disconnectSocket = () => {
    if(socket) {
        socket.disconnect();
        socket = null;
    }
}   