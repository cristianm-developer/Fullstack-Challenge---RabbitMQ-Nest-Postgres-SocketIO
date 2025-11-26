import { connectSocket, disconnectSocket } from "@/api/socket";
import { useAuthStore } from "@/domains/auth/store/auth.store";
import { useSocketStore } from "@/store/socket.store";
import { Socket } from "socket.io-client";
import { useEffect } from "react"

export const useSocketInitializer = () => {
    const { accessToken } = useAuthStore();
    const { setIsConnected, setSocket } = useSocketStore();
    
    
    useEffect(() => {
        let socketInstance: Socket | null = null;
        if(accessToken) {
            socketInstance = connectSocket();        
            setSocket(socketInstance);
            setIsConnected(true);
        }
        return () => {          
            if(socketInstance) {
                disconnectSocket();
                setSocket(null);
                setIsConnected(false);
            }
        }

    }, [accessToken])
}