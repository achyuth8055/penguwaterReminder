/**
 * Hand-drawn SVG icons — colourful replacements for the emoji the app used to
 * render. Every icon defaults to 1em so it scales with the surrounding font
 * size and aligns inline like an emoji did; pass a className to override.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps): IconProps => ({
  width: "1em",
  height: "1em",
  viewBox: "0 0 24 24",
  role: "img",
  "aria-hidden": true,
  focusable: false,
  ...props,
});

/** 💧 water drop */
export function DropIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M12 2.5c3.6 4.2 6.5 7.9 6.5 11.6a6.5 6.5 0 1 1-13 0C5.5 10.4 8.4 6.7 12 2.5Z"
        fill="#38bdf8"
      />
      <path
        d="M9 12.5c0 2.2 1.4 3.9 3.4 4.3"
        fill="none"
        stroke="#e0f4ff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 🔥 flame */
export function FireIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M12 2.5c1.3 2.6.6 4.4-.6 5.9-1.3 1.6-3 3-3 5.4a3.6 3.6 0 0 0 7.2 0c0-.9-.3-1.6-.7-2.3.9.4 1.6 1.2 1.6 2.7A5.5 5.5 0 0 1 6.5 14c0-4 3.4-5.9 4.3-9.1.3.5.8 1 1.2 1.4.7-1 .8-2.4 0-3.8Z"
        fill="#fb923c"
      />
      <path
        d="M12 12c1 1 1.4 1.9 1.4 2.8a1.9 1.9 0 0 1-3.8 0c0-1.4 1.3-2.1 2.4-2.8Z"
        fill="#fef08a"
      />
    </svg>
  );
}

/** 🏆 trophy */
export function TrophyIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M6 3h12v3a6 6 0 0 1-12 0V3Z"
        fill="#fbbf24"
      />
      <path
        d="M6 4H4a2 2 0 0 0 0 4h2.2M18 4h2a2 2 0 0 1 0 4h-2.2"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M10 11h4v3h-4z" fill="#f59e0b" />
      <path d="M8 20a4 4 0 0 1 8 0H8Z" fill="#fbbf24" />
      <rect x="9" y="18" width="6" height="2" rx="1" fill="#f59e0b" />
    </svg>
  );
}

/** ✅ check mark in a circle */
export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9.5" fill="#34d399" />
      <path
        d="m7.8 12.4 2.7 2.7 5.7-6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 🐧 penguin */
export function PenguinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <ellipse cx="12" cy="13" rx="7" ry="9" fill="#1f2937" />
      <ellipse cx="12" cy="14" rx="4.3" ry="6.5" fill="#f8fafc" />
      <circle cx="9.6" cy="9" r="1.1" fill="#1f2937" />
      <circle cx="14.4" cy="9" r="1.1" fill="#1f2937" />
      <path d="M12 10.2 13.7 12h-3.4L12 10.2Z" fill="#fb923c" />
      <path d="M6.5 19.5 4.5 21m13-1.5L19.5 21" stroke="#fb923c" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const HEART_FILL = {
  red: "#f43f5e",
  blue: "#60a5fa",
  pink: "#f9a8d4",
} as const;

/** ❤️ / 💙 / 🩷 heart — variant picks the colour */
export function HeartIcon({
  variant = "red",
  ...props
}: IconProps & { variant?: keyof typeof HEART_FILL }) {
  return (
    <svg {...base(props)}>
      <path
        d="M12 20.5S3.5 14.8 3.5 8.9A4.4 4.4 0 0 1 12 6.9a4.4 4.4 0 0 1 8.5 2c0 5.9-8.5 11.6-8.5 11.6Z"
        fill={HEART_FILL[variant]}
      />
    </svg>
  );
}
