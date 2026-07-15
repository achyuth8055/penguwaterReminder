/**
 * Renders one animation clip of a character from a PNG sprite sheet.
 *
 * This component is the ONLY place that knows sprites are PNG strips.
 * A future Rive/Lottie/Spine renderer can be dropped in behind the same
 * props (character + clip name + speed).
 */
import { CSSProperties } from "react";
import { Character, ClipName } from "@/types";
import { DEFAULT_MANIFEST, clipUrl } from "@/animations/manifest";
import { useSpriteClip } from "@/animations/useSpriteClip";

interface Props {
  character: Character;
  clip: ClipName;
  speed?: number;
  /** Mirror horizontally (used when walking off to the left/right). */
  flip?: boolean;
  /** Rendered size in px (sheet frames are 128×128). */
  size?: number;
  onClipEnd?: () => void;
}

export function CharacterSprite({
  character,
  clip,
  speed = 1,
  flip = false,
  size = 160,
  onClipEnd,
}: Props) {
  const def = DEFAULT_MANIFEST[clip];
  const frame = useSpriteClip(def, speed, onClipEnd);
  const scale = size / def.frameWidth;

  const style: CSSProperties = {
    width: def.frameWidth,
    height: def.frameHeight,
    backgroundImage: `url(${clipUrl(character, def.src)})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: `-${frame * def.frameWidth}px 0px`,
    // Sheets are high-res anti-aliased art — let the browser smooth them.
    imageRendering: "auto",
    transform: `scale(${scale}) ${flip ? "scaleX(-1)" : ""}`,
    transformOrigin: "bottom center",
  };

  return <div aria-hidden style={style} />;
}
