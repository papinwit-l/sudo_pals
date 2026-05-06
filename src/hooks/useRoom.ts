// hooks/useRoom.ts

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";
import { CellValue, Difficulty } from "@/types/sudoku";
import {
  ValidationMode,
  RoomState,
  RoomSession,
  SerializedBoard,
  SerializedPlayer,
  PlayerStats,
  PlayerColor,
} from "@/types/multiplayer";

const SESSION_KEY = "sudoku-room-session";

// ============================================
// Session persistence (sessionStorage)
// ============================================

function saveSession(session: RoomSession): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {}
}

function loadSession(): RoomSession | null {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

// ============================================
// Hook
// ============================================

export function useRoom() {
  const { status: connectionStatus, emit, on } = useSocket();
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasAttemptedRejoin = useRef(false);

  // ---- Auto-rejoin on reconnect ----
  useEffect(() => {
    if (connectionStatus !== "connected" || hasAttemptedRejoin.current) return;

    const session = loadSession();
    if (session) {
      hasAttemptedRejoin.current = true;
      emit("REJOIN_ROOM", {
        code: session.code,
        sessionToken: session.sessionToken,
      });
    }
  }, [connectionStatus, emit]);

  // ---- Socket event listeners ----
  useEffect(() => {
    if (connectionStatus === "disconnected") return;

    const cleanups: (() => void)[] = [];

    // ROOM_CREATED
    cleanups.push(
      on<{
        code: string;
        seed: number;
        board: SerializedBoard;
        isCustomSeed: boolean;
        validationMode: ValidationMode;
        sessionToken: string;
        playerId: string;
        color: PlayerColor;
      }>("ROOM_CREATED", (data) => {
        const session: RoomSession = {
          code: data.code,
          sessionToken: data.sessionToken,
          playerId: data.playerId,
        };
        saveSession(session);

        setRoomState({
          code: data.code,
          board: data.board,
          players: [
            {
              id: data.playerId,
              nickname: "", // will be set from player list
              color: data.color,
              status: "connected",
              selectedCell: null,
              cellsPlaced: 0,
            },
          ],
          myPlayerId: data.playerId,
          myColor: data.color,
          difficulty: "easy", // will be updated
          seed: data.seed,
          timer: 0,
          isCustomSeed: data.isCustomSeed,
          validationMode: data.validationMode,
          cellOwners: {},
          isComplete: false,
          completionStats: null,
        });
        setIsLoading(false);
        setError(null);
      }),
    );

    // ROOM_JOINED
    cleanups.push(
      on<{
        board: SerializedBoard;
        players: SerializedPlayer[];
        seed: number;
        difficulty: Difficulty;
        timer: number;
        isCustomSeed: boolean;
        validationMode: ValidationMode;
        sessionToken: string;
        playerId: string;
        color: PlayerColor;
        cellOwners: Record<string, string>;
      }>("ROOM_JOINED", (data) => {
        const session = loadSession();
        const code = session?.code || "";

        saveSession({
          code,
          sessionToken: data.sessionToken,
          playerId: data.playerId,
        });

        setRoomState({
          code,
          board: data.board,
          players: data.players,
          myPlayerId: data.playerId,
          myColor: data.color,
          difficulty: data.difficulty,
          seed: data.seed,
          timer: data.timer,
          isCustomSeed: data.isCustomSeed,
          validationMode: data.validationMode,
          cellOwners: data.cellOwners,
          isComplete: false,
          completionStats: null,
        });
        setIsLoading(false);
        setError(null);
      }),
    );

    // ROOM_STATE (reconnection)
    cleanups.push(
      on<{
        board: SerializedBoard;
        players: SerializedPlayer[];
        timer: number;
        yourNotes: Record<string, number[]>;
        cellOwners: Record<string, string>;
      }>("ROOM_STATE", (data) => {
        setRoomState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            board: data.board,
            players: data.players,
            timer: data.timer,
            cellOwners: data.cellOwners,
          };
        });
        setIsLoading(false);
      }),
    );

    // PLAYER_JOINED
    cleanups.push(
      on<{ playerId: string; nickname: string; color: PlayerColor }>(
        "PLAYER_JOINED",
        (data) => {
          setRoomState((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              players: [
                ...prev.players,
                {
                  id: data.playerId,
                  nickname: data.nickname,
                  color: data.color,
                  status: "connected",
                  selectedCell: null,
                  cellsPlaced: 0,
                },
              ],
            };
          });
        },
      ),
    );

    // PLAYER_LEFT
    cleanups.push(
      on<{ playerId: string; newCreatorId: string | null }>(
        "PLAYER_LEFT",
        (data) => {
          setRoomState((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              players: prev.players.filter((p) => p.id !== data.playerId),
            };
          });
        },
      ),
    );

    // PLAYER_DISCONNECTED
    cleanups.push(
      on<{ playerId: string }>("PLAYER_DISCONNECTED", (data) => {
        setRoomState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: prev.players.map((p) =>
              p.id === data.playerId
                ? { ...p, status: "disconnected" as const }
                : p,
            ),
          };
        });
      }),
    );

    // PLAYER_RECONNECTED
    cleanups.push(
      on<{ playerId: string }>("PLAYER_RECONNECTED", (data) => {
        setRoomState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: prev.players.map((p) =>
              p.id === data.playerId
                ? { ...p, status: "connected" as const }
                : p,
            ),
          };
        });
      }),
    );

    // BOARD_UPDATED
    cleanups.push(
      on<{
        row: number;
        col: number;
        value: number | null;
        playerId: string;
        isError: boolean;
      }>("BOARD_UPDATED", (data) => {
        setRoomState((prev) => {
          if (!prev) return prev;

          const newBoard = prev.board.map((row) =>
            row.map((cell) => ({ ...cell })),
          );
          newBoard[data.row][data.col] = {
            ...newBoard[data.row][data.col],
            value: data.value as CellValue,
            isError: data.isError,
          };

          const cellKey = `${data.row},${data.col}`;
          const newOwners = { ...prev.cellOwners };
          if (data.value !== null) {
            newOwners[cellKey] = data.playerId;
          } else {
            delete newOwners[cellKey];
          }

          return {
            ...prev,
            board: newBoard,
            cellOwners: newOwners,
          };
        });
      }),
    );

    // CELL_CLEARED
    cleanups.push(
      on<{ row: number; col: number; playerId: string }>(
        "CELL_CLEARED",
        (data) => {
          setRoomState((prev) => {
            if (!prev) return prev;

            const newBoard = prev.board.map((row) =>
              row.map((cell) => ({ ...cell })),
            );
            newBoard[data.row][data.col] = {
              ...newBoard[data.row][data.col],
              value: null,
              isError: false,
            };

            const cellKey = `${data.row},${data.col}`;
            const newOwners = { ...prev.cellOwners };
            delete newOwners[cellKey];

            return {
              ...prev,
              board: newBoard,
              cellOwners: newOwners,
            };
          });
        },
      ),
    );

    // CELL_SELECTED
    cleanups.push(
      on<{ row: number; col: number; playerId: string }>(
        "CELL_SELECTED",
        (data) => {
          setRoomState((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              players: prev.players.map((p) =>
                p.id === data.playerId
                  ? { ...p, selectedCell: { row: data.row, col: data.col } }
                  : p,
              ),
            };
          });
        },
      ),
    );

    // GAME_COMPLETE
    cleanups.push(
      on<{ stats: PlayerStats[]; time: number }>("GAME_COMPLETE", (data) => {
        setRoomState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            isComplete: true,
            completionStats: data,
          };
        });
      }),
    );

    // NEW_GAME_STARTED
    cleanups.push(
      on<{
        board: SerializedBoard;
        seed: number;
        difficulty: Difficulty;
        isCustomSeed: boolean;
        validationMode: ValidationMode;
      }>("NEW_GAME_STARTED", (data) => {
        setRoomState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            board: data.board,
            seed: data.seed,
            difficulty: data.difficulty,
            isCustomSeed: data.isCustomSeed,
            validationMode: data.validationMode,
            cellOwners: {},
            isComplete: false,
            completionStats: null,
            timer: 0,
            players: prev.players.map((p) => ({
              ...p,
              cellsPlaced: 0,
              selectedCell: null,
            })),
          };
        });
      }),
    );

    // ROOM_EXPIRED
    cleanups.push(
      on("ROOM_EXPIRED", () => {
        setRoomState(null);
        clearSession();
        setError("Room no longer exists");
      }),
    );

    // ERROR
    cleanups.push(
      on<{ message: string }>("ERROR", (data) => {
        setError(data.message);
        setIsLoading(false);
      }),
    );

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [connectionStatus, on]);

  // ---- Timer sync (client-side tick) ----
  useEffect(() => {
    if (!roomState || roomState.isComplete) return;

    const interval = setInterval(() => {
      setRoomState((prev) => {
        if (!prev) return prev;
        return { ...prev, timer: prev.timer + 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [roomState?.isComplete]);

  // ---- Actions ----

  const createRoom = useCallback(
    (
      nickname: string,
      difficulty: Difficulty,
      validationMode: ValidationMode,
      seed?: number,
    ) => {
      setIsLoading(true);
      setError(null);
      emit("CREATE_ROOM", { nickname, difficulty, validationMode, seed });
    },
    [emit],
  );

  const joinRoom = useCallback(
    (nickname: string, code: string) => {
      setIsLoading(true);
      setError(null);

      // Store code before emitting so ROOM_JOINED handler can access it
      saveSession({ code: code.toUpperCase(), sessionToken: "", playerId: "" });

      emit("JOIN_ROOM", { nickname, code: code.toUpperCase() });
    },
    [emit],
  );

  const placeNumber = useCallback(
    (row: number, col: number, value: number | null) => {
      if (!roomState) return;

      // Block fixed cells on client
      if (roomState.board[row][col].isFixed) return;

      emit("PLACE_NUMBER", { row, col, value });
    },
    [emit, roomState],
  );

  const clearCell = useCallback(
    (row: number, col: number) => {
      if (!roomState) return;
      if (roomState.board[row][col].isFixed) return;

      emit("CLEAR_CELL", { row, col });
    },
    [emit, roomState],
  );

  const selectCell = useCallback(
    (row: number, col: number) => {
      emit("SELECT_CELL", { row, col });
    },
    [emit],
  );

  const newGame = useCallback(
    (
      difficulty: Difficulty,
      validationMode?: ValidationMode,
      seed?: number,
    ) => {
      emit("NEW_GAME", { difficulty, validationMode, seed });
    },
    [emit],
  );

  const leaveRoom = useCallback(() => {
    emit("LEAVE_ROOM", {});
    setRoomState(null);
    clearSession();
  }, [emit]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    roomState,
    connectionStatus,
    error,
    isLoading,

    // Actions
    createRoom,
    joinRoom,
    placeNumber,
    clearCell,
    selectCell,
    newGame,
    leaveRoom,
    clearError,
  };
}
