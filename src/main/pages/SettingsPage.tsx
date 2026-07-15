/** Settings panel: theme, character, interval, autostart, sound, speed. */
import { useState } from "react";
import { Settings } from "@/types";
import { Toggle } from "@/components/ui/Toggle";
import { SettingRow } from "@/components/ui/SettingRow";
import { INTERVAL_PRESETS, SPEED_OPTIONS, formatInterval } from "@/main/constants";
import { HeartIcon } from "@/components/ui/icons";

interface Props {
  settings: Settings;
  update: (patch: Partial<Settings>) => Promise<void>;
}

export function SettingsPage({ settings, update }: Props) {
  const isPreset = (INTERVAL_PRESETS as readonly number[]).includes(settings.intervalMinutes);
  const [customOpen, setCustomOpen] = useState(!isPreset);
  const [custom, setCustom] = useState(isPreset ? 20 : settings.intervalMinutes);

  return (
    <div className="glass mx-auto max-w-2xl divide-y divide-ink/10 p-8 dark:divide-white/10">
      <SettingRow title="Theme" hint="Soft pastels, day or night">
        <div className="flex gap-2">
          {(["light", "dark"] as const).map((t) => (
            <button
              key={t}
              onClick={() => void update({ theme: t })}
              className={`rounded-full px-4 py-1.5 font-cute text-sm font-semibold capitalize ${
                settings.theme === t ? "bg-aqua-400 text-white" : "bg-white/60 dark:bg-white/10"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </SettingRow>

      <SettingRow title="Character" hint="Blue Pengu or Pink Pengu">
        <div className="flex gap-2">
          {(["boy", "girl"] as const).map((c) => (
            <button
              key={c}
              onClick={() => void update({ character: c })}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 font-cute text-sm font-semibold ${
                settings.character === c ? "bg-blush-400 text-white" : "bg-white/60 dark:bg-white/10"
              }`}
            >
              {c === "boy" ? "Boy" : "Girl"}
              <HeartIcon variant={c === "boy" ? "blue" : "pink"} />
            </button>
          ))}
        </div>
      </SettingRow>

      <SettingRow title="Reminder interval" hint="How often your buddy visits">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {INTERVAL_PRESETS.map((m) => (
            <button
              key={m}
              onClick={() => { setCustomOpen(false); void update({ intervalMinutes: m }); }}
              className={`rounded-full px-3 py-1.5 font-cute text-sm font-semibold ${
                !customOpen && settings.intervalMinutes === m
                  ? "bg-aqua-400 text-white"
                  : "bg-white/60 dark:bg-white/10"
              }`}
            >
              {formatInterval(m)}
            </button>
          ))}
          <button
            onClick={() => setCustomOpen(true)}
            className={`rounded-full px-3 py-1.5 font-cute text-sm font-semibold ${
              customOpen ? "bg-aqua-400 text-white" : "bg-white/60 dark:bg-white/10"
            }`}
          >
            Custom
          </button>
          {customOpen && (
            <span className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={1440}
                value={custom}
                onChange={(e) => setCustom(Number(e.target.value))}
                onBlur={() => {
                  const v = Math.min(Math.max(Math.round(custom) || 1, 1), 1440);
                  setCustom(v);
                  void update({ intervalMinutes: v });
                }}
                className="w-20 rounded-full bg-white/80 px-3 py-1.5 text-center text-sm dark:bg-white/10"
              />
              <span className="text-sm opacity-60">min</span>
            </span>
          )}
        </div>
      </SettingRow>

      <SettingRow title="Daily goal" hint="Glasses per day">
        <input
          type="number"
          min={1}
          max={20}
          value={settings.dailyGoalGlasses}
          onChange={(e) =>
            void update({ dailyGoalGlasses: Math.min(Math.max(Number(e.target.value) || 1, 1), 20) })
          }
          className="w-20 rounded-full bg-white/80 px-3 py-1.5 text-center text-sm dark:bg-white/10"
        />
      </SettingRow>

      <SettingRow title="Start on login" hint="Keep reminders working after reboot">
        <Toggle
          checked={settings.startOnLogin}
          onChange={(v) => void update({ startOnLogin: v })}
          label="Start on login"
        />
      </SettingRow>

      <SettingRow title="Sound" hint="Gentle pops and chimes">
        <Toggle
          checked={settings.soundEnabled}
          onChange={(v) => void update({ soundEnabled: v })}
          label="Sound"
        />
      </SettingRow>

      <SettingRow title="Animation speed" hint="How energetic your buddy is">
        <select
          value={settings.animationSpeed}
          onChange={(e) =>
            void update({ animationSpeed: Number(e.target.value) as Settings["animationSpeed"] })
          }
          className="rounded-full bg-white/80 px-4 py-1.5 font-cute text-sm font-semibold dark:bg-white/10"
        >
          {SPEED_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </SettingRow>
    </div>
  );
}
