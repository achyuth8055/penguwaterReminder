/** Decides whether Pengu should be in "public" (office) or "private" mode. */
import { MessageMode, OfficeMode } from "@/types";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** True if `now` falls inside the configured office window. */
export function isOfficeNow(office: OfficeMode, now: Date = new Date()): boolean {
  if (!office.days.includes(now.getDay())) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const start = toMinutes(office.start);
  const end = toMinutes(office.end);
  // Handles overnight windows too (e.g. 22:00 → 06:00), just in case.
  return start <= end
    ? minutes >= start && minutes < end
    : minutes >= start || minutes < end;
}

export function currentMode(office: OfficeMode, now: Date = new Date()): MessageMode {
  if (office.mode === "public") return "public";   // manual override
  if (office.mode === "private") return "private"; // manual override
  return isOfficeNow(office, now) ? "public" : "private";
}
