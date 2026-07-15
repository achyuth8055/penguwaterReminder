/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./reminder.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Soft pastel palette
        aqua: { 50: "#f0fbfc", 100: "#d6f4f7", 200: "#aee8ee", 300: "#7dd6e0", 400: "#4dbecd", 500: "#309fb0" },
        blush: { 100: "#fde8ef", 200: "#fbcfe0", 300: "#f7a8c4", 400: "#f07fa8" },
        cream: "#fff9f0",
        ink: "#3b4252",
      },
      fontFamily: {
        cute: ['"Baloo 2"', '"Comic Sans MS"', "system-ui", "sans-serif"],
        body: ['"Quicksand"', "system-ui", "sans-serif"],
      },
      borderRadius: { blob: "2rem" },
      boxShadow: {
        soft: "0 8px 32px rgba(60, 100, 140, 0.18)",
        glass: "inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 32px rgba(60,100,140,0.18)",
      },
    },
  },
  plugins: [],
};
