/** One labelled row in the settings panel. */
import { ReactNode } from "react";

export function SettingRow({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="font-cute text-base font-semibold">{title}</p>
        {hint && <p className="text-sm opacity-60">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
