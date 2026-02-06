"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import useApi from "@/hooks/useApi";

type WebSocketContextType = {
  socket: WebSocket | null;
  connect: (orderId: string) => Promise<void>;
  disconnect: () => void;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { accessToken } = useAuth();
  const api = useApi();

  // Use a ref to keep track of the socket instance for cleanup without re-renders
  const socketRef = useRef<WebSocket | null>(null);

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setSocket(null);
    }
  };

  const connect = async (orderId: string) => {
    if (!accessToken) return;
    if (socketRef.current) return; // Already connected

    try {
      const response = await api.post("/api/deliveries/ws-ticket", {}, { auth: "private" });

      const { ticket } = await response.json();

      // 2. Open WebSocket with the ticket
      const ws = new WebSocket(
        process.env.NEXT_PUBLIC_WEBSOCKET_BASE_URL + `/ws-location?ticket=${ticket}`
      );

      ws.onopen = () => {
        console.log("Connected to delivery tracking");
        // 3. Immediately tell the server which order we are interested in
        ws.send(JSON.stringify({ type: "JOIN", orderId }));
        socketRef.current = ws;
        setSocket(ws);
      };

      ws.onclose = () => {
        console.log("Disconnected");
        socketRef.current = null;
        setSocket(null);
      };

      ws.onerror = (err) => console.error("WebSocket Error:", err);
    } catch (err) {
      console.error("Failed to establish secure WebSocket:", err);
    }
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, connect, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error("useWebSocket must be used within WebSocketProvider");
  return context;
};
