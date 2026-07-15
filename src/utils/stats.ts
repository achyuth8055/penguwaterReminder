/** Pure statistics derived from the water history. Unit-testable. */
import { Stats, WaterEntry } from "@/types";
import { DAY_MS, dayKey, shortWeekday, startOfDay } from "./dates";

export function computeStats(history: WaterEntry[], dailyGoal: number): Stats {
  const goal = Math.max(dailyGoal, 1);
  const counts = new Map<string, number>();
  for (const e of history) {
    const k = dayKey(e.timestamp);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  const todayStart = startOfDay(Date.now());
  const todayGlasses = counts.get(dayKey(todayStart)) ?? 0;

  // Last 7 days, oldest first.
  const week = Array.from({ length: 7 }, (_, i) => {
    const ts = todayStart - (6 - i) * DAY_MS;
    const glasses = counts.get(dayKey(ts)) ?? 0;
    return { label: shortWeekday(ts), glasses, goalMet: glasses >= goal };
  });

  // Current streak: consecutive goal-met days ending today (or yesterday,
  // so an in-progress today doesn't break the streak).
  const met = (ts: number) => (counts.get(dayKey(ts)) ?? 0) >= goal;
  let currentStreak = 0;
  let cursor = met(todayStart) ? todayStart : todayStart - DAY_MS;
  while (met(cursor)) {
    currentStreak += 1;
    cursor -= DAY_MS;
  }

  // Longest streak over the whole history.
  let longestStreak = 0;
  if (history.length > 0) {
    const first = startOfDay(Math.min(...history.map((e) => e.timestamp)));
    let run = 0;
    for (let ts = first; ts <= todayStart; ts += DAY_MS) {
      run = met(ts) ? run + 1 : 0;
      longestStreak = Math.max(longestStreak, run);
    }
  }

  // Completion % over the last 30 days.
  let metDays = 0;
  for (let i = 0; i < 30; i++) if (met(todayStart - i * DAY_MS)) metDays += 1;
  const completionPct = Math.round((metDays / 30) * 100);

  return { todayGlasses, week, currentStreak, longestStreak, completionPct };
}
