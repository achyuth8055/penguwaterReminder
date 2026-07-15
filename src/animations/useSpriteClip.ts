/**
 * Frame stepper for a sprite-sheet clip.
 * Advances an integer frame index at clip.fps × speed using rAF timing.
 */
import { useEffect, useRef, useState } from "react";
import { SpriteClip } from "@/types";

export function useSpriteClip(
  clip: SpriteClip,
  speed: number,
  onDone?: () => void,
): number {
  const [frame, setFrame] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    setFrame(0);
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let current = 0;
    const frameMs = 1000 / (clip.fps * Math.max(speed, 0.1));

    const tick = (now: number) => {
      acc += now - last;
      last = now;
      while (acc >= frameMs) {
        acc -= frameMs;
        if (current < clip.frames - 1) {
          current += 1;
          setFrame(current);
        } else if (clip.loop) {
          current = 0;
          setFrame(0);
        } else {
          doneRef.current?.();
          return; // stop on last frame of a non-looping clip
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [clip, speed]);

  return frame;
}
