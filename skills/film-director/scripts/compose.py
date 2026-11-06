# /// script
# requires-python = ">=3.10"
# dependencies = ["mido==1.3.3", "numpy==2.2.6"]
# ///
"""Composes the film's score from score.json and plays it through sampled instruments.

The harmony is written against the film's own cue times, so every chord, swell and the final
chord land where the picture needs them by construction, not by searching a library track.
  uv run <skill>/scripts/compose.py score.json -o public/audio/music.wav
Writes music.wav, music.mid (open it in any DAW to hand edit) and music.landmarks.json.
Needs fluidsynth on PATH and the soundfont that install.sh fetches.
"""
import argparse
import json
import pathlib
import subprocess
import tempfile
import wave

import mido
import numpy as np

SKILL = pathlib.Path(__file__).resolve().parent.parent
SOUNDFONT = SKILL / "vendor" / "soundfont" / "GeneralUser-GS.sf2"
TICKS_PER_SEC = 960  # 480 ppq at the default 120 bpm
PROGRAMS = {"piano": 0, "strings": 49, "cello": 42, "bass": 43, "horn": 60, "choir": 52}
CHANNELS = {"piano": 0, "strings": 1, "cello": 2, "bass": 3, "horn": 4, "choir": 5}
NOTE_NAMES = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
QUALITIES = {
    "": (0, 4, 7), "m": (0, 3, 7), "sus2": (0, 2, 7), "sus4": (0, 5, 7), "add9": (0, 4, 7, 14),
    "madd9": (0, 3, 7, 14), "maj7": (0, 4, 7, 11), "m7": (0, 3, 7, 10), "7": (0, 4, 7, 10), "5": (0, 7),
}


def parse_chord(name):
    """'Dm' -> (2, (0, 3, 7)); 'Bbmaj7' -> (10, (0, 4, 7, 11)); 'F/A' keeps A as the bass."""
    body, _, bass = name.partition("/")
    root, rest = NOTE_NAMES[body[0]], body[1:]
    while rest[:1] in ("b", "#"):
        root += -1 if rest[0] == "b" else 1
        rest = rest[1:]
    if rest not in QUALITIES:
        raise ValueError(f"unknown chord quality in {name!r}")
    bass_pc = parse_chord(bass)[0] if bass else root % 12
    return root % 12, QUALITIES[rest], bass_pc


def note_number(name):
    """'A4' -> 69, 'Bb3' -> 58."""
    pc, octave = NOTE_NAMES[name[0]], name[1:]
    while octave[:1] in ("b", "#"):
        pc += -1 if octave[0] == "b" else 1
        octave = octave[1:]
    return 12 * (int(octave) + 1) + pc


def voice_lead(previous, pcs, low=50, high=74):
    """Picks the voicing of these pitch classes closest to the previous one: smooth inner voices."""
    candidates = [n for n in range(low, high + 1) if n % 12 in pcs]
    if not previous:
        return sorted(candidates[i] for i in range(0, min(len(candidates), 2 * len(pcs)), 2))[:4]
    voicing = []
    for note in previous:
        nearest = min(candidates, key=lambda c: (abs(c - note), c in voicing))
        voicing.append(nearest)
    missing = [pc for pc in pcs if pc not in {n % 12 for n in voicing}]
    for pc in missing:
        voicing[-1 - missing.index(pc) % len(voicing)] = min(
            (c for c in candidates if c % 12 == pc), key=lambda c: abs(c - voicing[-1]))
    return sorted(voicing)


def level_at(keys, t):
    """Dynamics keyframes [[t, level 0..1], ...] -> level at t, smooth (cosine) between keys."""
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, a), (t1, b) in zip(keys, keys[1:]):
        if t <= t1:
            x = (t - t0) / (t1 - t0) if t1 > t0 else 1.0
            return a + (b - a) * (1 - np.cos(np.pi * x)) / 2
    return keys[-1][1]


def plays(part, t, section_parts):
    return any(s["from"] <= t < s["to"] and part in s["parts"] for s in section_parts)


def chord_spans(score):
    chords = score["chords"]
    ends = [c["at"] for c in chords[1:]] + [score["duration"]]
    return [(c["at"], end, parse_chord(c["chord"])) for c, end in zip(chords, ends)]


def note(events, channel, pitch, start, end, velocity):
    velocity = int(np.clip(velocity, 1, 127))
    events.append((start, mido.Message("note_on", channel=channel, note=pitch, velocity=velocity)))
    events.append((end, mido.Message("note_off", channel=channel, note=pitch, velocity=0)))


def piano_part(score, spans, events):
    pulse, ch, voicing = score.get("piano_pulse", 1.5), CHANNELS["piano"], []
    for start, end, (root, quality, _) in spans:
        if not plays("piano", start, score["sections"]):
            continue
        voicing = voice_lead(voicing, {(root + i) % 12 for i in quality}, 57, 81)
        events.append((start, mido.Message("control_change", channel=ch, control=64, value=127)))
        events.append((max(start, end - 0.05), mido.Message("control_change", channel=ch, control=64, value=0)))
        for k, t in enumerate(np.arange(start, end - 0.2, pulse)):
            pitch = voicing[[0, 2, 1, 3][k % 4] % len(voicing)]
            note(events, ch, pitch, t, min(t + pulse * 2, end), 34 + 50 * level_at(score["dynamics"], t))


def held_part(score, spans, events, part, low, high, top=4):
    ch, voicing = CHANNELS[part], []
    for start, end, (root, quality, _) in spans:
        voicing = voice_lead(voicing, {(root + i) % 12 for i in quality}, low, high)
        if plays(part, start, score["sections"]):
            for pitch in voicing[-top:]:
                note(events, ch, pitch, start, end + 0.3, 70)


def bass_part(score, spans, events):
    for start, end, (_, _, bass_pc) in spans:
        pitch = 36 + (bass_pc - 36) % 12
        for part, octave in (("cello", 12), ("bass", 0)):
            if plays(part, start, score["sections"]):
                note(events, CHANNELS[part], pitch + octave, start, end + 0.3, 64)


def melody_part(score, events):
    for m in score.get("melody", []):
        level = level_at(score["dynamics"], m["at"])
        note(events, CHANNELS[m.get("part", "piano")], note_number(m["note"]), m["at"], m["at"] + m["dur"], 50 + 55 * level)


def expression(score, events):
    """Swells live on CC11 every 50 ms for the sustained parts, which is what makes strings breathe."""
    for t in np.arange(0, score["duration"], 0.05):
        value = int(20 + 107 * level_at(score["dynamics"], t))
        for part in ("strings", "cello", "bass", "horn", "choir"):
            events.append((t, mido.Message("control_change", channel=CHANNELS[part], control=11, value=value)))


def build_midi(score):
    events, spans = [], chord_spans(score)
    piano_part(score, spans, events)
    held_part(score, spans, events, "strings", 50, 79)
    held_part(score, spans, events, "horn", 53, 72, top=3)
    held_part(score, spans, events, "choir", 55, 76, top=3)
    bass_part(score, spans, events)
    melody_part(score, events)
    expression(score, events)
    return to_midi_file(events)


def to_midi_file(events):
    midi, track = mido.MidiFile(ticks_per_beat=480), mido.MidiTrack()
    midi.tracks.append(track)
    for part, channel in CHANNELS.items():
        track.append(mido.Message("program_change", channel=channel, program=PROGRAMS[part], time=0))
        track.append(mido.Message("control_change", channel=channel, control=91, value=40, time=0))
    clock = 0
    for t, message in sorted(events, key=lambda e: (e[0], e[1].type == "note_on")):
        tick = int(round(t * TICKS_PER_SEC))
        track.append(message.copy(time=tick - clock))
        clock = tick
    return midi


def hall_impulse(seconds=3.8, rate=48000, seed=7):
    """A synthetic stereo hall: decorrelated noise under an exponential decay with a soft top end."""
    rng = np.random.default_rng(seed)
    n = int(seconds * rate)
    decay = np.exp(-6.9 * np.arange(n) / n)
    noise = rng.standard_normal((n, 2)) * decay[:, None]
    kernel = np.ones(24) / 24
    noise = np.stack([np.convolve(noise[:, c], kernel, mode="same") for c in range(2)], axis=1)
    return (noise / np.abs(noise).max() * 0.5).astype(np.float32)


def write_wav(path, samples, rate=48000):
    pcm = (np.clip(samples, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as out:
        out.setnchannels(2)
        out.setsampwidth(2)
        out.setframerate(rate)
        out.writeframes(pcm.tobytes())


def render(midi_path, out_path, wet=0.32):
    with tempfile.TemporaryDirectory() as tmp:
        dry, ir = pathlib.Path(tmp) / "dry.wav", pathlib.Path(tmp) / "ir.wav"
        subprocess.run(["fluidsynth", "-ni", "-q", "-g", "0.6", "-r", "48000", "-F", str(dry),
                        str(SOUNDFONT), str(midi_path)], check=True)
        write_wav(ir, hall_impulse())
        graph = (f"[0:a]asplit[d][w];[w][1:a]afir=dry=10:wet=10[r];"
                 f"[d][r]amix=inputs=2:weights='{1 - wet} {wet}':normalize=0,alimiter=limit=0.7[o]")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(dry), "-i", str(ir), "-filter_complex", graph,
                        "-map", "[o]", "-ar", "48000", "-c:a", "pcm_s16le", str(out_path)], check=True)


def landmarks(score):
    spans = chord_spans(score)
    times = np.arange(0, score["duration"], 0.05)
    peak = float(times[np.argmax([level_at(score["dynamics"], t) for t in times])])
    first = min([s[0] for s in spans] + [m["at"] for m in score.get("melody", [])])
    return {"first_note": first, "peak": round(peak, 2), "final_chord": spans[-1][0],
            "chords": [{"at": s[0], "chord": c["chord"]} for s, c in zip(spans, score["chords"])]}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("score")
    ap.add_argument("-o", "--out", default="public/audio/music.wav")
    args = ap.parse_args()
    score = json.loads(pathlib.Path(args.score).read_text())
    out = pathlib.Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    midi_path = out.with_suffix(".mid")
    build_midi(score).save(midi_path)
    render(midi_path, out)
    marks = landmarks(score)
    out.with_suffix(".landmarks.json").write_text(json.dumps(marks, indent=2))
    print(json.dumps({"wav": str(out), "midi": str(midi_path), **{k: marks[k] for k in ("first_note", "peak", "final_chord")}}))


if __name__ == "__main__":
    main()
