/** Hand-rolled pastel bar chart of the last 7 days (no chart lib needed). */
import { motion } from "framer-motion";
import { Stats } from "@/types";

export function WeeklyChart({ week, goal }: { week: Stats["week"]; goal: number }) {
  const max = Math.max(goal, ...week.map((d) => d.glasses), 1);

  return (
    <div className="glass p-6">
      <h3 className="font-cute text-lg font-semibold">This week</h3>
      <div className="mt-4 flex h-40 items-end justify-between gap-3">
        {week.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-xs font-semibold opacity-70">{d.glasses}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.glasses / max) * 100}%` }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 160, damping: 20 }}
              className={`w-full rounded-t-xl ${
                d.goalMet ? "bg-aqua-400" : "bg-blush-300"
              }`}
              style={{ minHeight: d.glasses > 0 ? 6 : 2 }}
              title={`${d.glasses} glasses`}
            />
            <span className="text-xs opacity-60">{d.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs opacity-50">
        <span className="mr-3 inline-block h-2 w-2 rounded-full bg-aqua-400" /> goal met ({goal}+)
        <span className="ml-4 mr-3 inline-block h-2 w-2 rounded-full bg-blush-300" /> below goal
      </p>
    </div>
  );
}
