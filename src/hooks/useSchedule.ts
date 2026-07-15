/** Countdown to the next reminder, kept in sync with the Rust scheduler. */
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { ScheduleState } from "@/types";

export function useSchedule() {
  const [schedule, setSchedule] = useState<ScheduleState | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    void invoke<ScheduleState>("get_schedule").then(setSchedule);
    const un = listen<ScheduleState>("schedule-updated", (e) => setSchedule(e.payload));
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(t);
      void un.then((f) => f());
    };
  }, []);

  const msLeft = schedule ? Math.max(schedule.nextFireAtMs - now, 0) : null;
  const countdown =
    msLeft === null || msLeft > 365 * 24 * 3600_000
      ? null // sentinel "waiting for answer" state
      : `${String(Math.floor(msLeft / 3600_000)).padStart(2, "0")}:${String(
          Math.floor((msLeft % 3600_000) / 60_000),
        ).padStart(2, "0")}:${String(Math.floor((msLeft % 60_000) / 1000)).padStart(2, "0")}`;

  return { schedule, countdown };
}
