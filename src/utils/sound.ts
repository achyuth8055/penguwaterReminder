/** Tiny sound helper. Sounds live in /public/sounds and are toggleable. */

const cache = new Map<string, HTMLAudioElement>();

export function playSound(name: "pop" | "success", enabled: boolean): void {
  if (!enabled) return;
  let audio = cache.get(name);
  if (!audio) {
    audio = new Audio(`/sounds/${name}.wav`);
    audio.volume = 0.5;
    cache.set(name, audio);
  }
  // Restart if already playing; ignore autoplay rejections.
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}
