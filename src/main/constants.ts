import { AnimationSpeed } from "@/types";

export const INTERVAL_PRESETS = [30, 45, 60, 90] as const;

export const SPEED_OPTIONS: { label: string; value: AnimationSpeed }[] = [
  { label: "Slow", value: 0.5 },
  { label: "Chill", value: 0.75 },
  { label: "Normal", value: 1 },
  { label: "Zippy", value: 1.5 },
  { label: "Fast", value: 2 },
];
