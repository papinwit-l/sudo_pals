// src/app/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateSeed } from "@/utils/random";
import { Difficulty } from "@/types/sudoku";
import { ValidationMode } from "@/types/multiplayer";
import { useRoom } from "@/hooks/useRoom";

type Screen = "home" | "create" | "join";

const difficultyEmoji: Record<Difficulty, string> = {
  easy: "🌸",
  medium: "🌼",
  hard: "🔥",
};

const validationLabels: Record<
  ValidationMode,
  { label: string; desc: string }
> = {
  conflict: { label: "Conflict", desc: "Only flags duplicates in row/col/box" },
  strict: { label: "Strict", desc: "Checks against the solution" },
};

export default function Home() {
  const router = useRouter();
  const {
    roomState,
    connectionStatus,
    error,
    isLoading,
    createRoom,
    joinRoom,
    clearError,
  } = useRoom();

  const [screen, setScreen] = useState<Screen>("home");
  const [nickname, setNickname] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [validationMode, setValidationMode] =
    useState<ValidationMode>("conflict");
  const [customSeed, setCustomSeed] = useState("");
  const [roomCode, setRoomCode] = useState("");

  // Navigate to room when joined/created
  useEffect(() => {
    if (roomState) {
      router.push(`/room/${roomState.code}`);
    }
  }, [roomState, router]);

  function handleSoloPlay(d: Difficulty) {
    const seed = generateSeed();
    router.push(`/solo/${d}/${seed}`);
  }

  function handleCreateRoom() {
    if (!nickname.trim()) return;
    const seed = customSeed.trim()
      ? parseInt(customSeed.trim(), 10) || undefined
      : undefined;
    createRoom(nickname.trim(), difficulty, validationMode, seed);
  }

  function handleJoinRoom() {
    if (!nickname.trim() || !roomCode.trim()) return;
    joinRoom(nickname.trim(), roomCode.trim());
  }

  function goBack() {
    setScreen("home");
    clearError();
  }

  return (
    <div className="sudoku-theme flex flex-col items-center w-full px-4 py-6 max-w-lg mx-auto min-h-screen justify-center">
      {/* Title */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-4xl">🧩</span>
        <h1 className="text-[clamp(1.8rem,6vw,2.5rem)] font-extrabold tracking-tight text-[var(--color-title)]">
          SudoPals
        </h1>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 w-full py-2 px-4 rounded-xl text-center bg-red-100 text-red-700 text-sm font-medium dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ---- HOME SCREEN ---- */}
      {screen === "home" && (
        <div className="w-full flex flex-col gap-3">
          {/* Solo Play */}
          <div className="bg-[var(--color-action-bg)] rounded-2xl p-5">
            <h2 className="text-sm font-bold text-[var(--color-action-text)] mb-3">
              🎮 Solo Play
            </h2>
            <div className="flex gap-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  className="flex-1 py-2.5 rounded-xl capitalize text-sm font-semibold
                             bg-[var(--color-numpad-bg)] text-[var(--color-numpad-text)]
                             hover:bg-[var(--color-numpad-hover)] active:scale-95
                             transition-all duration-150 cursor-pointer"
                  onClick={() => handleSoloPlay(d)}
                >
                  {difficultyEmoji[d]} {d}
                </button>
              ))}
            </div>
          </div>

          {/* Multiplayer */}
          <div className="bg-[var(--color-action-bg)] rounded-2xl p-5">
            <h2 className="text-sm font-bold text-[var(--color-action-text)] mb-3">
              👥 Multiplayer
            </h2>
            <div className="flex gap-2">
              <button
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                           bg-[var(--color-accent)] text-white
                           hover:opacity-90 active:scale-95
                           transition-all duration-150 cursor-pointer shadow-md"
                onClick={() => setScreen("create")}
              >
                Create Room
              </button>
              <button
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                           bg-[var(--color-numpad-bg)] text-[var(--color-numpad-text)]
                           hover:bg-[var(--color-numpad-hover)] active:scale-95
                           transition-all duration-150 cursor-pointer"
                onClick={() => setScreen("join")}
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- CREATE ROOM SCREEN ---- */}
      {screen === "create" && (
        <div className="w-full flex flex-col gap-4">
          <button
            className="self-start text-sm text-[var(--color-action-text)] hover:underline cursor-pointer"
            onClick={goBack}
          >
            ← Back
          </button>

          <div className="bg-[var(--color-action-bg)] rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[var(--color-action-text)]">
              Create a Room
            </h2>

            {/* Nickname */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={16}
                placeholder="Enter your nickname"
                className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--color-cell-bg)]
                           text-[var(--color-text-fixed)] border border-[var(--color-grid-thin)]
                           outline-none focus:border-[var(--color-accent)]
                           transition-colors"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                Difficulty
              </label>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    className={`flex-1 py-2 rounded-xl capitalize text-xs font-semibold
                               transition-all duration-150 cursor-pointer active:scale-95
                               ${
                                 difficulty === d
                                   ? "bg-[var(--color-accent)] text-white shadow-md"
                                   : "bg-[var(--color-numpad-bg)] text-[var(--color-numpad-text)] hover:bg-[var(--color-numpad-hover)]"
                               }`}
                    onClick={() => setDifficulty(d)}
                  >
                    {difficultyEmoji[d]} {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Validation Mode */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                Validation Mode
              </label>
              <div className="flex gap-2">
                {(["conflict", "strict"] as const).map((mode) => (
                  <button
                    key={mode}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold
                               transition-all duration-150 cursor-pointer active:scale-95
                               ${
                                 validationMode === mode
                                   ? "bg-[var(--color-accent)] text-white shadow-md"
                                   : "bg-[var(--color-numpad-bg)] text-[var(--color-numpad-text)] hover:bg-[var(--color-numpad-hover)]"
                               }`}
                    onClick={() => setValidationMode(mode)}
                  >
                    {mode === "conflict" ? "⚔️" : "🎯"}{" "}
                    {validationLabels[mode].label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                {validationLabels[validationMode].desc}
              </p>
            </div>

            {/* Custom Seed (optional) */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                Custom Seed (optional)
              </label>
              <input
                type="text"
                value={customSeed}
                onChange={(e) => setCustomSeed(e.target.value)}
                placeholder="Leave empty for random"
                className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--color-cell-bg)]
                           text-[var(--color-text-fixed)] border border-[var(--color-grid-thin)]
                           outline-none focus:border-[var(--color-accent)]
                           transition-colors"
              />
            </div>

            {/* Create Button */}
            <button
              className="w-full py-3 rounded-xl text-sm font-bold
                         bg-[var(--color-accent)] text-white shadow-md
                         hover:opacity-90 active:scale-95
                         transition-all duration-150 cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCreateRoom}
              disabled={!nickname.trim() || isLoading}
            >
              {isLoading ? "Creating..." : "🎲 Create Room"}
            </button>
          </div>
        </div>
      )}

      {/* ---- JOIN ROOM SCREEN ---- */}
      {screen === "join" && (
        <div className="w-full flex flex-col gap-4">
          <button
            className="self-start text-sm text-[var(--color-action-text)] hover:underline cursor-pointer"
            onClick={goBack}
          >
            ← Back
          </button>

          <div className="bg-[var(--color-action-bg)] rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[var(--color-action-text)]">
              Join a Room
            </h2>

            {/* Nickname */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={16}
                placeholder="Enter your nickname"
                className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--color-cell-bg)]
                           text-[var(--color-text-fixed)] border border-[var(--color-grid-thin)]
                           outline-none focus:border-[var(--color-accent)]
                           transition-colors"
              />
            </div>

            {/* Room Code */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={4}
                placeholder="e.g. XK3M"
                className="w-full px-3 py-2 rounded-xl text-sm font-mono tracking-widest text-center
                           bg-[var(--color-cell-bg)] text-[var(--color-text-fixed)]
                           border border-[var(--color-grid-thin)]
                           outline-none focus:border-[var(--color-accent)]
                           transition-colors uppercase"
              />
            </div>

            {/* Join Button */}
            <button
              className="w-full py-3 rounded-xl text-sm font-bold
                         bg-[var(--color-accent)] text-white shadow-md
                         hover:opacity-90 active:scale-95
                         transition-all duration-150 cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleJoinRoom}
              disabled={!nickname.trim() || !roomCode.trim() || isLoading}
            >
              {isLoading ? "Joining..." : "🚪 Join Room"}
            </button>
          </div>
        </div>
      )}

      {/* Connection status */}
      {connectionStatus !== "connected" && screen !== "home" && (
        <div className="mt-4 text-xs text-[var(--color-text-muted)]">
          {connectionStatus === "connecting"
            ? "🔄 Connecting to server..."
            : "⚠️ Disconnected"}
        </div>
      )}
    </div>
  );
}
