#!/usr/bin/env python3
"""Generates soft UI sounds: public/sounds/{pop,success}.wav (pure stdlib)."""
import math, struct, wave
from pathlib import Path

RATE = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "sounds"


def write(name, samples):
    OUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT / name), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, s)) * 32767)) for s in samples))
    print("wrote", OUT / name)


def tone(freq, dur, vol=0.4, slide=1.0):
    n = int(RATE * dur)
    out = []
    for i in range(n):
        t = i / RATE
        f = freq * (slide ** (t / dur))
        env = math.sin(math.pi * min(t / 0.01, 1)) if t < 0.01 else math.exp(-4 * (t - 0.01))
        out.append(vol * env * math.sin(2 * math.pi * f * t))
    return out


# "pop": quick upward blip
write("pop.wav", tone(520, 0.18, vol=0.35, slide=1.6))

# "success": two cheerful notes
write("success.wav", tone(660, 0.16, vol=0.3, slide=1.2) + tone(880, 0.28, vol=0.3, slide=1.1))
