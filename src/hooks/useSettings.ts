/**
 * Settings state: loads from the store, saves on change, and applies
 * side-effects (dark-mode class, Rust scheduler interval, OS autostart).
 */
import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { DEFAULT_SETTINGS, Settings } from "@/types";
import { loadSettings, saveSettings } from "@/utils/storage";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void loadSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  // Apply dark mode to the document.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  const update = useCallback(
    async (patch: Partial<Settings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      await saveSettings(next);

      if (patch.intervalMinutes !== undefined) {
        await invoke("set_interval", { minutes: patch.intervalMinutes });
      }
      if (patch.startOnLogin !== undefined) {
        try {
          const on = await isEnabled();
          if (patch.startOnLogin && !on) await enable();
          if (!patch.startOnLogin && on) await disable();
        } catch (e) {
          console.warn("autostart not available:", e);
        }
      }
    },
    [settings],
  );

  return { settings, update, loaded };
}
