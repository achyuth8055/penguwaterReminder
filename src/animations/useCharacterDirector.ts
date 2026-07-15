/**
 * The choreography state machine for the reminder popup.
 *
 * Entrance:  walk-in → stop → idle → blink → gentle float + speech bubble
 * "Yes":     happy ("Yay! Good job ❤️") → wave → walk off-screen
 * "Later":   sad ("Okay... I'll come back in 5 minutes.") → walk off-screen
 *
 * The hook only decides WHAT plays WHEN; rendering is CharacterSprite +
 * framer-motion transforms in the popup.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ClipName, MessageMode } from "@/types";

/**
 * Message sets: "public" keeps it office-friendly (no pet names on a work
 * screen); "private" is the cozy after-hours voice. Mode is chosen
 * automatically from the office-hours schedule in Settings.
 */
const MESSAGES: Record<MessageMode, Record<"asking" | "celebrate" | "waving" | "snoozed", string>> = {
  public: {
    asking: "hai Pengu ❤️\ndid you drink water?",
    celebrate: "yay! good job ❤️",
    waving: "okay byee!\nI'll remind you next time slot",
    snoozed: "okay… I'll come back\nin 5 minutes",
  },
  private: {
    asking: "hai Pengu ❤️\ndid you drink water?",
    celebrate: "yayy good job bebb ❤️",
    waving: "I'll come back later\nto remind you again ❤️",
    snoozed: "okay ❤️ bye bebb\nI'll remind you soon…",
  },
};

export type Phase =
  | "entering"   // walking in from off-screen
  | "settling"   // brief idle after stopping
  | "asking"     // floating + speech bubble, waiting for the user
  | "celebrate"  // pressed Yes → happy message
  | "waving"     // goodbye wave
  | "snoozed"    // pressed Later → sad message
  | "leaving"    // walking off-screen
  | "done";      // window may close

interface Director {
  phase: Phase;
  clip: ClipName;
  /** True while the character should bob up and down (framer float). */
  floating: boolean;
  bubbleText: string | null;
  answerYes: () => void;
  answerLater: () => void;
  /** Called by the popup when the walk-off transform finishes. */
  onExitFinished: () => void;
}

const SETTLE_MS = 700;
const CELEBRATE_MS = 1600;
const SNOOZE_MS = 1600;
const WAVE_MS = 1500;
const BLINK_EVERY_MS: [number, number] = [2500, 5500];

export function useCharacterDirector(
  speed: number,
  onDone: (answer: "yes" | "later") => void,
  mode: MessageMode = "private",
): Director {
  const [phase, setPhase] = useState<Phase>("entering");
  const [blinking, setBlinking] = useState(false);
  const answerRef = useRef<"yes" | "later">("yes");
  const timers = useRef<number[]>([]);

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms / Math.max(speed, 0.1)));
  }, [speed]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Random blinking while idle/asking.
  useEffect(() => {
    if (phase !== "settling" && phase !== "asking") return;
    let t: number;
    const schedule = () => {
      const [min, max] = BLINK_EVERY_MS;
      t = window.setTimeout(() => {
        setBlinking(true);
        window.setTimeout(() => { setBlinking(false); schedule(); }, 320);
      }, min + Math.random() * (max - min));
    };
    schedule();
    return () => clearTimeout(t);
  }, [phase]);

  /** Popup calls this when the walk-in x-transform completes. */
  const enterFinishedRef = useRef(false);
  useEffect(() => {
    if (phase !== "entering") return;
    // Walk-in duration is owned by the framer transition (see popup);
    // mirror it here so clips switch at the right moment.
    after(1800, () => {
      if (enterFinishedRef.current) return;
      enterFinishedRef.current = true;
      setPhase("settling");
      after(SETTLE_MS, () => setPhase("asking"));
    });
  }, [phase, after]);

  const answerYes = useCallback(() => {
    if (phase !== "asking") return;
    answerRef.current = "yes";
    setPhase("celebrate");
    after(CELEBRATE_MS, () => {
      setPhase("waving");
      after(WAVE_MS, () => setPhase("leaving"));
    });
  }, [phase, after]);

  const answerLater = useCallback(() => {
    if (phase !== "asking") return;
    answerRef.current = "later";
    setPhase("snoozed");
    after(SNOOZE_MS, () => setPhase("leaving"));
  }, [phase, after]);

  const onExitFinished = useCallback(() => {
    setPhase("done");
    onDone(answerRef.current);
  }, [onDone]);

  const clip: ClipName =
    phase === "entering" || phase === "leaving" ? "walk"
    : phase === "celebrate" ? "happy"
    : phase === "waving" ? "wave"
    : phase === "snoozed" ? "sad"
    : blinking ? "blink"
    : "idle";

  const texts = MESSAGES[mode];
  const bubbleText =
    phase === "asking" ? texts.asking
    : phase === "celebrate" ? texts.celebrate
    : phase === "waving" ? texts.waving
    : phase === "snoozed" ? texts.snoozed
    : null;

  return {
    phase,
    clip,
    floating: phase === "asking",
    bubbleText,
    answerYes,
    answerLater,
    onExitFinished,
  };
}
