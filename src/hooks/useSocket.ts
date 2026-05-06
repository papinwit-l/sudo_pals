// hooks/useSocket.ts

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

type UseSocketReturn = {
  status: ConnectionStatus;
  emit: <T>(event: string, data?: T) => void;
  on: <T>(event: string, handler: (data: T) => void) => () => void;
};

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  useEffect(() => {
    const socket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id);
      setStatus("connected");
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      setStatus("disconnected");
    });

    socket.on("reconnecting", () => {
      setStatus("connecting");
    });

    socket.on("reconnect_attempt", () => {
      setStatus("connecting");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
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
    status,
    emit,
    on,
  };
}
