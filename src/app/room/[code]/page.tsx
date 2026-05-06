// src/app/room/[code]/page.tsx

"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MultiplayerGame = dynamic(() => import("@/components/MutliplayerGame"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  ),
});

export default function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();

  function handleBack() {
    router.push("/");
  }

  return <MultiplayerGame key={code} code={code} onBack={handleBack} />;
}
