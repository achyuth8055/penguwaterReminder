/**
 * Sprite-sheet manifests. Each clip is a horizontal PNG strip under
 * /public/characters/<character>/.
 *
 * To upgrade to Rive/Lottie/Spine later: implement a new renderer behind
 * CharacterSprite and map ClipName → animation names; nothing else changes.
 */
import { Character, SpriteManifest } from "@/types";

const FRAME = 256;

/** Matches the sheets produced by scripts/generate_sprites.py. */
export const DEFAULT_MANIFEST: SpriteManifest = {
  walk: { src: "walk.png", frameWidth: FRAME, frameHeight: FRAME, frames: 6, fps: 10, loop: true },
  idle: { src: "idle.png", frameWidth: FRAME, frameHeight: FRAME, frames: 4, fps: 4, loop: true },
  blink: { src: "blink.png", frameWidth: FRAME, frameHeight: FRAME, frames: 3, fps: 10, loop: false },
  wave: { src: "wave.png", frameWidth: FRAME, frameHeight: FRAME, frames: 6, fps: 8, loop: true },
  happy: { src: "happy.png", frameWidth: FRAME, frameHeight: FRAME, frames: 4, fps: 6, loop: true },
  sad: { src: "sad.png", frameWidth: FRAME, frameHeight: FRAME, frames: 2, fps: 2, loop: true },
};

export function clipUrl(character: Character, src: string): string {
  return `/characters/${character}/${src}`;
}
