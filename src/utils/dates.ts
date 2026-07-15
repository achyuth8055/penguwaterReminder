/** Small date helpers (local-time day boundaries). */

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function shortWeekday(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { weekday: "short" });
}

export const DAY_MS = 24 * 60 * 60 * 1000;
