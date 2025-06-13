"use client";

import { Auth } from "@/components/Auth";
import TaskForm from "@/components/TaskForm";
import TaskGrid from "@/components/TaskGrid";
import { useSupabaseSession } from "@/hooks/session";

export default function Home() {
  const { session } = useSupabaseSession();

  return (
    <div className="flex justify-center pt-10 h-screen space-y-6 px-3">
      {session ? (
        <div className="flex gap-4 w-full max-w-[1000px]">
          <TaskForm session={session} />
          <TaskGrid />
        </div>
      ) : (
        <Auth />
      )}
    </div>
  );
}
