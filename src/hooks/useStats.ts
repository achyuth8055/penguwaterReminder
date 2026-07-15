/** Live statistics: recomputed when history changes (reminder answered). */
import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { Stats } from "@/types";
import { loadHistory } from "@/utils/storage";
import { computeStats } from "@/utils/stats";

export function useStats(dailyGoal: number): Stats | null {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let alive = true;
    const refresh = () =>
      void loadHistory().then((h) => {
        if (alive) setStats(computeStats(h, dailyGoal));
      });

    refresh();
    // The Rust core emits this after every confirm/snooze — cheap refresh hook.
    const un = listen("schedule-updated", refresh);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      window.removeEventListener("focus", onFocus);
      void un.then((f) => f());
    };
  }, [dailyGoal]);

  return stats;
}
