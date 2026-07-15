/** Main window shell: onboarding gate + Dashboard / Settings tabs. */
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSettings } from "@/hooks/useSettings";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { SettingsPage } from "./pages/SettingsPage";
import { PenguinIcon, HeartIcon } from "@/components/ui/icons";

type Tab = "dashboard" | "settings";

export default function App() {
  const { settings, update, loaded } = useSettings();
  const [tab, setTab] = useState<Tab>("dashboard");

  if (!loaded) return null;

  // First launch → character selection.
  if (!settings.character) {
    return <Onboarding onComplete={(patch) => void update(patch)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-aqua-100 via-cream to-blush-100 dark:from-ink dark:via-[#2b3245] dark:to-[#3a3050] dark:text-cream">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 pt-8 pb-6">
        <h1 className="flex items-center gap-1.5 font-cute text-2xl font-bold text-aqua-500">
          <PenguinIcon />
          <span>hai Pengu</span>
          <HeartIcon />
        </h1>
        <nav className="glass flex gap-1 !rounded-full p-1">
          {(["dashboard", "settings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2 font-cute text-sm font-semibold capitalize transition ${
                tab === t ? "bg-aqua-400 text-white shadow-soft" : "hover:bg-white/50 dark:hover:bg-white/10"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      <main className="px-6 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "dashboard" ? (
              <Dashboard settings={settings} />
            ) : (
              <SettingsPage settings={settings} update={update} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
