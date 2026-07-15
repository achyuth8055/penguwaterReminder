/** Pastel toggle switch. */
import { motion } from "framer-motion";

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

export function Toggle({ checked, onChange, label }: Props) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex h-8 w-14 items-center rounded-full p-1 transition-colors ${
        checked ? "bg-aqua-400" : "bg-ink/20 dark:bg-white/20"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`h-6 w-6 rounded-full bg-white shadow ${checked ? "ml-auto" : ""}`}
      />
    </button>
  );
}
