/** Statistics dashboard: today's glasses, weekly graph, streaks, completion. */
import { invoke } from "@tauri-apps/api/core";
import { Settings } from "@/types";
import { useStats } from "@/hooks/useStats";
import { useSchedule } from "@/hooks/useSchedule";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { StatCard } from "@/main/components/StatCard";
import { WeeklyChart } from "@/main/components/WeeklyChart";
import { currentMode } from "@/utils/officeMode";
import { DropIcon, FireIcon, TrophyIcon, CheckIcon } from "@/components/ui/icons";

export function Dashboard({ settings }: { settings: Settings }) {
  const stats = useStats(settings.dailyGoalGlasses);
  const { countdown } = useSchedule();
  const character = settings.character ?? "boy"; // blue Pengu by default

  if (!stats) return null;

  const goalPct = Math.min(
    Math.round((stats.todayGlasses / settings.dailyGoalGlasses) * 100),
    100,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Hero: buddy + today's progress + next-reminder countdown */}
      <div className="glass flex items-center gap-6 p-6">
        <div className="flex h-[120px] w-[110px] items-end justify-center overflow-hidden">
          <CharacterSprite
            character={character}
            clip={goalPct >= 100 ? "happy" : "idle"}
            size={110}
            speed={settings.animationSpeed}
          />
        </div>
        <div className="flex-1">
          <h2 className="font-cute text-2xl font-bold">
            {stats.todayGlasses} / {settings.dailyGoalGlasses} glasses today
          </h2>
          <div className="mt-2 h-4 w-full overflow-hidden rounded-full bg-white/60 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-aqua-300 to-aqua-400 transition-all duration-700"
              style={{ width: `${goalPct}%` }}
            />
          </div>
          <p className="mt-2 text-sm opacity-60">
            {countdown
              ? `Next reminder in ${countdown}`
              : "Your buddy is on screen — answer the popup!"}
            <span
              className="ml-2 rounded-full bg-white/60 px-2 py-0.5 font-cute text-xs font-semibold dark:bg-white/10"
              title="Which message style the next reminder will use"
            >
              {currentMode(settings.officeMode) === "public" ? "🏢 public mode" : "🏠 private mode"}
            </span>
          </p>
        </div>
        <button
          className="btn-secondary text-sm"
          onClick={() =>
            void invoke("show_reminder_now").catch((e) => console.error("preview failed:", e))
          }
        >
          Preview reminder
        </button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<DropIcon />} label="Today" value={String(stats.todayGlasses)} />
        <StatCard icon={<FireIcon />} label="Streak" value={`${stats.currentStreak}d`} />
        <StatCard icon={<TrophyIcon />} label="Longest" value={`${stats.longestStreak}d`} />
        <StatCard icon={<CheckIcon />} label="30-day goal" value={`${stats.completionPct}%`} />
      </div>

      <WeeklyChart week={stats.week} goal={settings.dailyGoalGlasses} />
    </div>
  );
}
