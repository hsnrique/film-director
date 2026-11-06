# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy==2.2.6"]
# ///
"""The agent cannot hear, so it reads the sound as numbers before anyone listens.
Prints a loudness curve (one bar per half second), the brightness, the onsets, the silences, and
whether each named moment in the film has the dip before it and the lift on it.
  uv run <skill>/scripts/listen.py public/audio/music.wav [--moments 28,31.5] [--json out.json]
"""
import argparse
import json
import subprocess

import numpy as np

RATE = 24000
WINDOW = 0.5


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(RATE), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def db(x):
    return 20 * np.log10(max(float(x), 1e-6))


def curve(samples):
    step = int(RATE * WINDOW)
    frames = [samples[i:i + step] for i in range(0, len(samples) - step + 1, step)]
    return np.array([db(np.sqrt(np.mean(f ** 2))) for f in frames])


def brightness(samples):
    """Spectral centroid in Hz: under ~1500 reads warm and dark, over ~3000 bright and thin."""
    spectrum = np.abs(np.fft.rfft(samples[: RATE * 30]))
    freqs = np.fft.rfftfreq(min(len(samples), RATE * 30), 1 / RATE)
    return float(np.sum(freqs * spectrum) / np.sum(spectrum))


def onsets(samples, hop=0.02):
    step = int(RATE * hop)
    energy = np.array([np.sum(samples[i:i + step] ** 2) for i in range(0, len(samples) - step, step)])
    flux = np.maximum(np.diff(np.log(energy + 1e-9)), 0)
    threshold = np.mean(flux) + 2.5 * np.std(flux)
    hits, last = [], -1.0
    for i, value in enumerate(flux):
        t = (i + 1) * hop
        if value > threshold and t - last > 0.25:
            hits.append(round(t, 2))
            last = t
    return hits


def silences(levels, floor=-50):
    spans, start = [], None
    for i, level in enumerate(np.append(levels, 0)):
        if level < floor and start is None:
            start = i
        elif level >= floor and start is not None:
            spans.append([start * WINDOW, i * WINDOW])
            start = None
    return spans


def moment_report(levels, t):
    i = int(t / WINDOW)
    before = levels[max(0, i - 2):i].mean() if i > 0 else levels[0]
    on = levels[i:i + 2].mean()
    return {"at": t, "before_db": round(float(before), 1), "on_db": round(float(on), 1),
            "lift_db": round(float(on - before), 1)}


def bar(level, low=-60, high=-6):
    return "#" * int(np.clip((level - low) / (high - low), 0, 1) * 40)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("audio")
    ap.add_argument("--moments", default="", help="comma separated seconds where the film turns")
    ap.add_argument("--json", default=None)
    args = ap.parse_args()
    samples = decode(args.audio)
    levels = curve(samples)
    for i, level in enumerate(levels):
        print(f"{i * WINDOW:6.1f}s {level:6.1f} dB {bar(level)}")
    moments = [moment_report(levels, float(t)) for t in args.moments.split(",") if t]
    report = {"duration": round(len(samples) / RATE, 2), "peak_db": round(db(np.abs(samples).max()), 1),
              "brightness_hz": round(brightness(samples)), "onsets": onsets(samples),
              "silences": silences(levels), "moments": moments}
    print(json.dumps(report, indent=1))
    if args.json:
        with open(args.json, "w") as out:
            json.dump({**report, "curve": [round(float(x), 1) for x in levels]}, out, indent=1)


if __name__ == "__main__":
    main()
