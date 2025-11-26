import { create } from "zustand";
import { Socket } from "socket.io-client";

interface SocketState {
    socket: Socket | null;
    isConnected: boolean;
    setSocket(socket: Socket | null): void;
    setIsConnected(isConnected: boolean): void;
    handleNewEvent(eventName: string, callback: (data: any) => void): void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
    isConnected: false,
    socket: null,
    setSocket: (socket: Socket | null) => set({ socket }),
    setIsConnected: (isConnected: boolean) => set({ isConnected }),
    handleNewEvent: (eventName: string, callback: (data: any) => void) => {
        console.log('handleNewEvent', eventName, callback);
        const socket = get().socket;
        if(socket) {
            socket.on(eventName, callback);
        }
    }
}))