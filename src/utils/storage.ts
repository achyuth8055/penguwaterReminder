/**
 * Persistence layer, backed by tauri-plugin-store (a JSON file in the app's
 * data dir, so it survives reboots). Swap this module for SQLite later
 * without touching callers.
 */
import { LazyStore } from "@tauri-apps/plugin-store";
import { DEFAULT_SETTINGS, Settings, WaterEntry } from "@/types";

// One store file shared by both windows and read by the Rust scheduler.
export const store = new LazyStore("hydro-buddy.json");

const SETTINGS_KEY = "settings";
const HISTORY_KEY = "history";

export async function loadSettings(): Promise<Settings> {
  const saved = await store.get<Partial<Settings>>(SETTINGS_KEY);
  const merged = {
    ...DEFAULT_SETTINGS,
    ...saved,
    // Deep-merge nested objects so settings saved by older builds
    // still pick up new fields' defaults.
    officeMode: { ...DEFAULT_SETTINGS.officeMode, ...saved?.officeMode },
  };
  // Migration: earlier builds had a third "pengu" character → now blue boy.
  if ((merged.character as string) === "pengu") merged.character = "boy";
  return merged;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await store.set(SETTINGS_KEY, settings);
  await store.save();
}

export async function loadHistory(): Promise<WaterEntry[]> {
  return (await store.get<WaterEntry[]>(HISTORY_KEY)) ?? [];
}

/** Append one glass and return the updated history. */
export async function logGlass(): Promise<WaterEntry[]> {
  const history = await loadHistory();
  history.push({ timestamp: Date.now() });
  // Keep at most ~1 year of entries so the file stays tiny.
  const cutoff = Date.now() - 366 * 24 * 60 * 60 * 1000;
  const trimmed = history.filter((e) => e.timestamp >= cutoff);
  await store.set(HISTORY_KEY, trimmed);
  await store.save();
  return trimmed;
}
