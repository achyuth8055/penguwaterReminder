/**
 * First-launch flow: pick your buddy (Boy / Girl) and a reminder interval.
 * Shown until settings.character is set.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Character, Settings } from "@/types";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { INTERVAL_PRESETS, formatInterval } from "@/main/constants";
import { HeartIcon } from "@/components/ui/icons";

interface Props {
  onComplete: (patch: Partial<Settings>) => void;
}

export function Onboarding({ onComplete }: Props) {
  // Blue Pengu pre-selected 💙
  const [character, setCharacter] = useState<Character | null>("boy");
  const [interval, setInterval] = useState(60);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-aqua-100 via-cream to-blush-100 p-8 dark:from-ink dark:via-[#2b3245] dark:to-[#3a3050]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-xl p-10 text-center"
      >
        <h1 className="flex items-center justify-center gap-2 font-cute text-3xl font-bold text-aqua-500">
          hai Pengu <HeartIcon />
        </h1>
        <p className="mt-2 opacity-70">Choose your buddy</p>

        <div className="mt-8 flex justify-center gap-6">
          {(["boy", "girl"] as const).map((c) => (
            <motion.button
              key={c}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setCharacter(c)}
              aria-pressed={character === c}
              className={`flex w-44 flex-col items-center gap-2 rounded-blob border-4 p-6 transition ${
                character === c
                  ? "border-aqua-400 bg-white/80 shadow-soft dark:bg-white/10"
                  : "border-transparent bg-white/40 hover:bg-white/60 dark:bg-white/5"
              }`}
            >
              <div className="flex h-[130px] items-end justify-center overflow-hidden">
                <CharacterSprite
                  character={c}
                  clip={character === c ? "happy" : "idle"}
                  size={120}
                />
              </div>
              <span className="flex items-center gap-1.5 font-cute text-lg font-semibold">
                {c === "boy" ? "Boy" : "Girl"}
                <HeartIcon variant={c === "boy" ? "blue" : "pink"} />
              </span>
            </motion.button>
          ))}
        </div>

        <p className="mt-8 font-cute font-semibold">Remind me every…</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {INTERVAL_PRESETS.map((m) => (
            <button
              key={m}
              onClick={() => setInterval(m)}
              className={`rounded-full px-4 py-2 font-cute text-sm font-semibold transition ${
                interval === m
                  ? "bg-aqua-400 text-white shadow-soft"
                  : "bg-white/60 hover:bg-white dark:bg-white/10"
              }`}
            >
              {formatInterval(m)}
            </button>
          ))}
        </div>

        <button
          disabled={!character}
          onClick={() =>
            character && onComplete({ character, intervalMinutes: interval })
          }
          className="btn-primary mt-10 w-full text-lg disabled:cursor-not-allowed disabled:opacity-40"
        >
          Let's stay hydrated!
        </button>
      </motion.div>
    </div>
  );
}
