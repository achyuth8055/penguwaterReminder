import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

/**
 * Two entry points build from a single Vite project:
 *  - index.html    → the main dashboard / settings window
 *  - reminder.html → the frameless always-on-top reminder popup
 */
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: { ignored: ["**/src-tauri/**"] },
  },
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  build: {
    target: ["es2021", "chrome100", "safari14"],
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        reminder: resolve(__dirname, "reminder.html"),
      },
    },
  },
});
