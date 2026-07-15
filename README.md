# 🐧 hai Pengu ❤️

A cute cross-platform desktop app (Windows + macOS) that reminds you to drink water. Instead of a boring notification, Pengu the penguin (or a boy/girl buddy) walks onto your screen on a fully transparent popup, asks "hai Pengu ❤️ did you drink water?", and reacts to your answer. Built with **Tauri v2 + React + TypeScript + Vite + TailwindCSS + Framer Motion**.

## Quick start

Prereqs: Node 18+, Rust (rustup), and the [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS.

```bash
npm install
npm run app:dev      # run in development
npm run app:build    # produce installers (see Packaging)
```

Placeholder sprites/sounds/icons are committed. To regenerate: `python3 scripts/generate_sprites.py && python3 scripts/generate_sounds.py && python3 scripts/generate_icons.py` (needs `pip install pillow`).

## How it works (phase by phase)

### Phase 1 — Structure

```
hydro-buddy/
├── index.html / reminder.html      # two webview entry points, one Vite build
├── public/
│   ├── characters/{boy,girl}/      # PNG sprite-sheet strips (128px frames)
│   └── sounds/                     # pop.wav, success.wav
├── scripts/                        # asset generators (sprites, sounds, icons)
├── src/
│   ├── animations/                 # sprite engine + choreography state machine
│   ├── components/                 # character renderer, speech bubble, UI kit
│   ├── hooks/                      # useSettings, useStats, useSchedule
│   ├── main/                       # dashboard window (pages, components)
│   ├── reminder/                   # popup window app
│   ├── styles/ types/ utils/       # css, shared types, storage/stats/date/sound
└── src-tauri/
    ├── src/lib.rs                  # plugins, tray, window lifecycle
    ├── src/scheduler.rs            # background reminder loop (tokio)
    ├── src/commands.rs             # IPC surface for the webviews
    └── src/window.rs               # reminder popup creation/placement
```

### Phase 2 — Reminder window
`window.rs` builds a 400×500 webview: frameless, transparent (`macOSPrivateApi` enabled for macOS), always-on-top, visible on all workspaces, skip-taskbar, created **unfocused** so it never steals your keyboard. It is positioned DPI-aware at the bottom-right of the primary monitor and shown only after positioning (no flicker). It **never auto-dismisses** — only the two buttons end it; the React card fades in/out and then asks Rust to close the window.

### Phase 3 — Animation system
- `useSpriteClip` steps frames of a horizontal PNG strip at `fps × animationSpeed` using rAF.
- `CharacterSprite` is the only component that knows sprites are PNGs — swap in a Rive/Lottie/Spine renderer behind the same props later without touching choreography.
- `useCharacterDirector` runs the sequence: **walk in → stop → idle → random blinks → gentle float + speech bubble → wait**. "Yes" → happy ("Yay! Good job ❤️") → wave → walk off. "Later" → "Okay… I'll come back in 5 minutes." → walk off.
- Framer Motion owns the transforms (walk-in x, float y, bubble spring, card fades).

### Phase 4 — Scheduler
Lives in **Rust** (`scheduler.rs`) on the tokio runtime, so it runs even with every window closed. It sleeps until `next_fire_at`, opens the popup, and waits for `confirm_drink` (full interval) or `snooze_reminder` (5 min). The fire time is persisted in the store file; with **start-on-login** enabled the schedule survives reboots, and a reminder missed while powered off fires ~30 s after startup. A tray icon (Open Dashboard / Water check now / Quit) keeps the app controllable; closing the dashboard hides it instead of quitting.

### Phase 5 — Settings & onboarding
First launch shows a character picker (Boy/Girl) + interval choice. Settings cover theme (light/dark), character, interval (30/45/60/90/custom), daily goal, start on login (`tauri-plugin-autostart`), sound, and animation speed. Everything persists via `tauri-plugin-store` to `hydro-buddy.json` in the app data dir — replaceable with SQLite later by swapping `src/utils/storage.ts`.

### Phase 6 — Statistics
Every "Yes" logs a timestamped glass. `src/utils/stats.ts` (pure, testable) derives: today's glasses, last-7-days bar chart, current streak, longest streak, and 30-day completion %. The dashboard refreshes live via the `schedule-updated` event.

### Phase 7 — Packaging

```bash
npm run app:build
```

- **Windows**: produces NSIS `.exe` (and MSI) under `src-tauri/target/release/bundle/`. Per-user install, no admin needed. For distribution without SmartScreen warnings, sign with a code-signing cert (`bundle.windows.certificateThumbprint` in `tauri.conf.json`).
- **macOS**: produces `.app` and `.dmg` under the same path. Build on macOS (cross-compiling is not supported). For distribution, sign + notarize:
  ```bash
  export APPLE_SIGNING_IDENTITY="Developer ID Application: …"
  export APPLE_ID=… APPLE_PASSWORD=… APPLE_TEAM_ID=…
  npm run app:build
  ```
  Universal binary: `npm run tauri build -- --target universal-apple-darwin`.
- CI: use `tauri-apps/tauri-action` on GitHub Actions with a `windows-latest` + `macos-latest` matrix to build both installers per release.

## Replacing the placeholder art

Drop your own strips into `public/characters/<name>/` (any frame size) and update `src/animations/manifest.ts`. For Rive/Lottie: implement a renderer with the same props as `CharacterSprite` and map the six clip names.

## Notes

- The Linux/Windows/macOS Rust code compiles on first `tauri dev`/`tauri build`; it targets stable Tauri v2 APIs.
- Transparent windows on macOS require `macOSPrivateApi: true` (already set). On Windows transparency works out of the box.
