/** Cute speech bubble with a pop-in spring and a little tail.
 *
 * The bubble itself has a FIXED width and mounts only once per visit —
 * when the message changes (ask → yay → bye) only the text crossfades,
 * so the bubble never shifts left/up between messages.
 */
import { Fragment } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeartIcon } from "@/components/ui/icons";

/** Render a line, swapping any ❤️ marker for an inline heart SVG. */
function renderLine(line: string) {
  const parts = line.split("❤️");
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && (
        <HeartIcon className="mx-0.5 inline-block align-[-0.125em]" />
      )}
    </Fragment>
  ));
}

export function SpeechBubble({ text }: { text: string | null }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          key="bubble" // stable key: the bubble pops in once, then stays put
          initial={{ opacity: 0, scale: 0.6, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 4 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className="relative w-[290px] rounded-2xl bg-white/95 px-4 py-3 text-center
                     font-cute text-lg font-semibold leading-snug text-ink shadow-soft
                     dark:bg-white/90"
        >
          {/* Only the words swap — quick crossfade, no movement */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={text}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              {text.split("\n").map((line, i) => (
                <span key={i} className="block">{renderLine(line)}</span>
              ))}
            </motion.div>
          </AnimatePresence>
          {/* bubble tail */}
          <span
            className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45
                       bg-white/95 dark:bg-white/90"
            aria-hidden
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
