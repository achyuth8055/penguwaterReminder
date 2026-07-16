/** Shared domain types for Hydro Buddy. */

/** Both characters are penguins: "boy" = blue Pengu, "girl" = pink Pengu. */
export type Character = "boy" | "girl";
export type Theme = "light" | "dark";

/** Multiplier applied to all character animations (0.5 = slow … 2 = fast). */
export type AnimationSpeed = 0.5 | 0.75 | 1 | 1.5 | 2;

/**
 * Message-mode control.
 *  - "auto":    public texts during the office window below, private outside
 *  - "public":  always work-safe texts (manual override)
 *  - "private": always cozy texts (manual override)
 */
export interface OfficeMode {
  mode: "auto" | "public" | "private";
  /** "HH:MM" 24h local time (used in auto mode) */
  start: string;
  end: string;
  /** Active weekdays, 0 = Sunday … 6 = Saturday (used in auto mode) */
  days: number[];
}

export interface Settings {
  theme: Theme;
  character: Character | null; // null until onboarding completes
  intervalMinutes: number; // 30 | 45 | 60 | 90 | … | custom
  startOnLogin: boolean;
  soundEnabled: boolean;
  animationSpeed: AnimationSpeed;
  dailyGoalGlasses: number;
  officeMode: OfficeMode;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  character: null,
  intervalMinutes: 60,
  startOnLogin: true,
  soundEnabled: true,
  animationSpeed: 1,
  dailyGoalGlasses: 8,
  officeMode: {
    mode: "auto",
    start: "08:30",
    end: "17:50",
    days: [1, 2, 3, 4, 5], // Mon–Fri
  },
};

/** Which message set the reminder should use. */
export type MessageMode = "public" | "private";

/** One confirmed glass of water. */
export interface WaterEntry {
  /** Unix epoch ms when the user pressed "Yes". */
  timestamp: number;
}

export interface Stats {
  todayGlasses: number;
  /** Last 7 days, oldest first: { label: "Mon", glasses: n, goalMet: bool } */
  week: { label: string; glasses: number; goalMet: boolean }[];
  currentStreak: number;
  longestStreak: number;
  /** % of days (over last 30) where the daily goal was met. */
  completionPct: number;
}

/** Payload the Rust scheduler sends with the `schedule-updated` event. */
export interface ScheduleState {
  nextFireAtMs: number;
  intervalMinutes: number;
}

/** Character animation clips. Names map to sprite-sheet manifests. */
export type ClipName =
  | "walk"
  | "idle"
  | "blink"
  | "wave"
  | "happy"
  | "sad";

/** Manifest describing one PNG sprite-sheet strip (horizontal frames). */
export interface SpriteClip {
  /** Path under /characters/<name>/, e.g. "walk.png". */
  src: string;
  frameWidth: number;
  frameHeight: number;
  frames: number;
  /** Frames per second at animationSpeed = 1. */
  fps: number;
  loop: boolean;
}

export type SpriteManifest = Record<ClipName, SpriteClip>;
