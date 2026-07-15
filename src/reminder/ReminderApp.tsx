/**
 * The reminder popup. Lives in its own frameless/transparent Tauri window.
 *
 * Flow: fade in → character walks in → idle/blink → floats + speech bubble →
 * user MUST press "Yes" or "Remind me in 5 minutes" (never auto-dismisses) →
 * farewell animation → walk off → fade out → Rust closes the window.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Settings, DEFAULT_SETTINGS } from "@/types";
import { loadSettings, logGlass } from "@/utils/storage";
import { playSound } from "@/utils/sound";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { SpeechBubble } from "@/components/character/SpeechBubble";
import { useCharacterDirector } from "@/animations/useCharacterDirector";
import { DropIcon } from "@/components/ui/icons";

const WALK_DISTANCE = 300; // px travelled when entering/leaving

export function ReminderApp() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [visible, setVisible] = useState(true);
  const finishing = useRef(false);

  useEffect(() => {
    void loadSettings().then((s) => {
      setSettings(s);
      playSound("pop", s.soundEnabled);
    });
    // If the scheduler fires while this window is still open, restart.
    const un = listen("reminder-replay", () => window.location.reload());
    return () => { void un.then((f) => f()); };
  }, []);

  const speed = settings.animationSpeed;

  const handleDone = useCallback(async (answer: "yes" | "later") => {
    if (finishing.current) return;
    finishing.current = true;
    try {
      if (answer === "yes") {
        await logGlass(); // persist the glass BEFORE touching the scheduler
        await invoke("confirm_drink");
      } else {
        await invoke("snooze_reminder", { minutes: 5 });
      }
    } finally {
      setVisible(false); // triggers card fade-out (see onAnimationComplete)
    }
  }, []);

  const director = useCharacterDirector(speed, handleDone);
  const { phase, clip, floating, bubbleText, answerYes, answerLater } = director;

  const onYes = () => { playSound("success", settings.soundEnabled); answerYes(); };
  const onLater = () => answerLater();

  const character = settings.character ?? "boy"; // blue Pengu by default

  // Character x-position: off-screen left → centre → off-screen right.
  const x =
    phase === "entering" ? [-WALK_DISTANCE, 0]
    : phase === "leaving" || phase === "done" ? WALK_DISTANCE
    : 0;

  return (
    // Fullscreen click-shield: the window covers the whole monitor and this
    // layer swallows every click until she answers. A soft dim makes it
    // obvious the screen is waiting on Pengu.
    <motion.div
      className="flex h-screen w-screen items-end justify-end p-8 pb-24"
      initial={{ backgroundColor: "rgba(30, 41, 59, 0)" }}
      animate={{
        backgroundColor: visible ? "rgba(30, 41, 59, 0.35)" : "rgba(30, 41, 59, 0)",
      }}
      transition={{ duration: 0.45 }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* No card background — Pengu floats directly on the desktop.
          Bubble and buttons carry their own backgrounds for legibility. */}
      <motion.div
        className={`flex w-[368px] flex-col items-center gap-3 px-2 pb-4 pt-2 ${
          settings.theme === "dark" ? "dark" : ""
        }`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 24 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        onAnimationComplete={() => {
          if (!visible) void invoke("close_reminder");
        }}
      >
        {/* Speech bubble */}
        <div className="flex min-h-[84px] items-end justify-center">
          <SpeechBubble text={bubbleText} />
        </div>

        {/* Character stage */}
        <div className="relative h-[170px] w-full overflow-hidden">
          <motion.div
            className="absolute bottom-0 left-1/2 -ml-[64px]"
            animate={{ x, y: floating ? [0, -6, 0] : 0 }}
            transition={{
              x: { duration: 1.8 / Math.max(speed, 0.1), ease: "easeInOut" },
              y: floating
                ? { duration: 2.4 / Math.max(speed, 0.1), repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.3 },
            }}
            onAnimationComplete={() => {
              if (phase === "leaving") director.onExitFinished();
            }}
          >
            <CharacterSprite character={character} clip={clip} speed={speed} size={160} />
          </motion.div>
        </div>

        {/* Answer buttons — the ONLY way to dismiss the reminder */}
        <motion.div
          className="flex w-full flex-col gap-2.5"
          initial={false}
          animate={{
            opacity: phase === "asking" ? 1 : 0,
            pointerEvents: phase === "asking" ? "auto" : "none",
          }}
          transition={{ duration: 0.3 }}
        >
          <button
            className="btn-primary flex w-full items-center justify-center gap-1.5 text-lg"
            onClick={onYes}
          >
            Yes <DropIcon />
          </button>
          <button
            className="btn-secondary w-full !bg-white/95 shadow-soft dark:!bg-[#2b3245] dark:text-cream"
            onClick={onLater}
          >
            Remind me in 5 minutes
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
