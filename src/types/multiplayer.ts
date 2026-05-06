// types/multiplayer.ts

import { CellValue, Difficulty, Position } from "./sudoku";

export type ValidationMode = "conflict" | "strict";

export type PlayerColor =
  | "indigo"
  | "rose"
  | "emerald"
  | "amber"
  | "cyan"
  | "purple"
  | "orange"
  | "teal";

export type PlayerStatus = "connected" | "disconnected";

export type SerializedCell = {
  value: CellValue;
  isFixed: boolean;
  isError: boolean;
};

export type SerializedBoard = SerializedCell[][];

export type SerializedPlayer = {
  id: string;
  nickname: string;
  color: PlayerColor;
  status: PlayerStatus;
  selectedCell: Position | null;
  cellsPlaced: number;
};

export type PlayerStats = {
  playerId: string;
  nickname: string;
  color: PlayerColor;
  cellsPlaced: number;
};

// ============================================
// Session storage for reconnection
// ============================================

export type RoomSession = {
  code: string;
  sessionToken: string;
  playerId: string;
};

// ============================================
// Room state (client-side)
// ============================================

export type RoomState = {
  code: string;
  board: SerializedBoard;
  players: SerializedPlayer[];
  myPlayerId: string;
  myColor: PlayerColor;
  difficulty: Difficulty;
  seed: number;
  timer: number;
  isCustomSeed: boolean;
  validationMode: ValidationMode;
  cellOwners: Record<string, string>; // "row,col" -> playerId
  isComplete: boolean;
  completionStats: {
    stats: PlayerStats[];
    time: number;
  } | null;
};

// ============================================
// Player color map (for CSS)
// ============================================

export const PLAYER_COLOR_MAP: Record<PlayerColor, string> = {
  indigo: "#6366f1",
  rose: "#f43f5e",
  emerald: "#10b981",
  amber: "#f59e0b",
  cyan: "#06b6d4",
  purple: "#a855f7",
  orange: "#f97316",
  teal: "#14b8a6",
};
