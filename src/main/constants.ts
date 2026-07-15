import { AnimationSpeed } from "@/types";

/** Reminder interval presets, in minutes. */
export const INTERVAL_PRESETS = [30, 45, 60, 90, 120, 180, 240] as const;

/** 90 → "1.5 hr", 60 → "1 hr", 45 → "45 min" */
export function formatInterval(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = minutes / 60;
  return `${Number.isInteger(hrs) ? hrs : hrs.toFixed(1)} hr`;
}

export const SPEED_OPTIONS: { label: string; value: AnimationSpeed }[] = [
  { label: "Slow", value: 0.5 },
  { label: "Chill", value: 0.75 },
  { label: "Normal", value: 1 },
  { label: "Zippy", value: 1.5 },
  { label: "Fast", value: 2 },
];
