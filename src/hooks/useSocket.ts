// hooks/useSocket.ts

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

type UseSocketReturn = {
  socket: Socket | null;
  status: ConnectionStatus;
  emit: <T>(event: string, data?: T) => void;
  on: <T>(event: string, handler: (data: T) => void) => () => void;
};

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("[Socket] Connected:", newSocket.id);
      setStatus("connected");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      setStatus("disconnected");
    });

    newSocket.on("reconnecting", () => {
      setStatus("connecting");
    });

    newSocket.on("reconnect_attempt", () => {
      setStatus("connecting");
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, []);

  const emit = useCallback(<T>(event: string, data?: T) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback(<T>(event: string, handler: (data: T) => void) => {
    const listener = handler as (...args: unknown[]) => void;
    socketRef.current?.on(event, listener);
    return () => {
      socketRef.current?.off(event, listener);
    };
  }, []);

  return {
    socket,
    status,
    emit,
    on,
  };
}
