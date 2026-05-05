// src/app/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { generateSeed } from "@/utils/random";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const seed = generateSeed();
    router.replace(`/easy/${seed}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}
