# Sound

The sound is designed first and the picture is cut to it. A viewer forgives a soft frame; they do not forgive a cheap sound.

## Layers, bottom to top

1. **Room tone.** A quiet recorded bed under everything, looped, so silence is never digital zero.
2. **Score.** One continuous take for the whole film.
3. **Designed hits.** At most one per act, on the film's turns (ignition, dawn, reveal). A real impact with a sub and a tail, not a stack of synth layers.
4. **Foley.** Only what the picture does, at real world levels: key presses on typed lines, the click on a button, a mug set down, steps, a door. Nothing that the image does not show.
5. **Voice**, when there is one, clearly on top.

## The score

### Composed here (default)

`score.json` is the score, written against the chapter table:

```json
{
  "duration": 37,
  "piano_pulse": 1.5,
  "chords": [{"at": 1.5, "chord": "Dmadd9"}, {"at": 5.5, "chord": "Bbmaj7"}, {"at": 28, "chord": "Dadd9"}],
  "dynamics": [[0, 0.08], [26.2, 0.58], [27.1, 0.04], [27.85, 0.04], [28, 0.84], [37, 0.28]],
  "sections": [{"from": 0, "to": 26.5, "parts": ["piano"]}, {"from": 28, "to": 37, "parts": ["piano", "horn", "choir"]}],
  "melody": [{"at": 1.5, "note": "A4", "dur": 3.5}, {"at": 28, "note": "A4", "dur": 2.5, "part": "horn"}]
}
```

- `chords`: one chord per cut or turn, at its second. Qualities: major, `m`, `sus2`, `sus4`, `add9`, `madd9`, `maj7`, `m7`, `7`, `5`, and slash bass (`F/A`). Voices move to the nearest notes, so the strings glide instead of jumping.
- `dynamics`: the arc, 0 to 1, smooth between keys. A dip to about 0.04 for 0.7 s before the payoff, then a jump, is the silence before the hit.
- `sections`: which parts play when (`piano`, `strings`, `cello`, `bass`, `horn`, `choir`). Leaving the piano out of a stretch is how a moment empties.
- `melody`: the motif, a few notes. Give it to the horn at the payoff.
- Minor lifting to major at the payoff (D minor to D major) reads as earned light; staying minor reads as tension.
- `compose.py` writes `music.wav`, `music.mid` (open it in any DAW to hand edit) and `music.landmarks.json` (first note, peak, every chord time). Scenes and cues read the landmarks.
- Read it with `listen.py --moments <turns>`: the curve should rise act by act, each turn should show a dip before it and a lift on it, `brightness_hz` under about 1500 reads warm.

### Commissioned (when the user asks)

- Commission one take for the whole length (ElevenLabs Music through the connected account, or a track the user licenses). Prompt for: piano and strings, the key, the arc ("sparse and close for the first 40 s, a lift at 1:40, peak around 1:55, resolves under the logo"), no drums unless the brief wants energy.
- Generate two takes, listen to the measured landmarks of each (first note, bloom, peak, last chord) and pick the one whose landmarks fit the chapter table. Keep the rejected takes beside the chosen one.
- Place it so its first note lands after the fade from black (about 1.5 s in) and its last chord rings under the end card.
- Measure the landmarks with `uv run <emd>/scripts/beats.py public/audio/music.wav --fps <fps>` and put them in `roteiro.json` as named cues; scenes read the cues, never a typed frame number.
- When the film must change length, stretch or bridge the score (a legato stretch of the bars before the gap); never leave a dead cut between two pieces of music.

## Silence

- Real silence (a dip to about -10 dB, not a hard cut) for 0.8 to 1.2 s before the two or three biggest moments.
- After the first note, the bed never falls below about -42 dB: the film breathes, it does not drop out.

## Voice over the bed

- Render the bed alone, measure it under every line, and duck until it sits 12 to 14 dB (RMS) under the voice.
- Ramp down over 0.8 s and back up over 1.5 s; never dip past -12 dB; stay down between lines closer than 2.5 s.
- ElevenLabs v3 voices can cut off the last word: append a soft breath cue to the line ("[exhales softly]"), then trim where the words end and fade 60 ms.

## Master

- -16 LUFS integrated, true peak -1 dBTP, a gentle glue compressor and a look ahead limiter. Set `loudness` in `public/timeline.json` to `{ "lufs": -16, "tp": -1 }` before `mix.py`.
- Check the result with `qa.py` (it reads loudness and true peak) and say the measured numbers in the delivery.

## Credits and cost

- Every generated or downloaded file goes into `public/audio/credits.json` with its prompt or source and licence.
- Before any paid generation, say the credits it will cost and wait for a yes. Keep the running total in the handoff.
