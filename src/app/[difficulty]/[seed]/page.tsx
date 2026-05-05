// src/app/[difficulty]/[seed]/page.tsx

"use client";

import dynamic from "next/dynamic";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Difficulty } from "@/types/sudoku";
import { generateSeed } from "@/utils/random";

const Game = dynamic(() => import("@/components/Game"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  ),
});

const validDifficulties = ["easy", "medium", "hard"];

export default function GamePage({
  params,
}: {
  params: Promise<{ difficulty: string; seed: string }>;
}) {
  const { difficulty, seed } = use(params);
  console.log("Page params:", difficulty, seed);

  const router = useRouter();

  const diff: Difficulty = validDifficulties.includes(difficulty)
    ? (difficulty as Difficulty)
    : "easy";

  const seedNum = parseInt(seed, 10);
  const validSeed = isNaN(seedNum) ? 1 : seedNum;

  function handleNewGame(d: Difficulty) {
    const newSeed = generateSeed();
    router.push(`/${d}/${newSeed}`);
  }

  // key forces full remount when params change
  return (
    <Game
      key={`${diff}-${validSeed}`}
      difficulty={diff}
      seed={validSeed}
      onNewGame={handleNewGame}
    />
  );
}
