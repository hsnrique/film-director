# Film Director: the README film

Status: final. Output: `docs/media/film-director.mp4` (0:37, 1920x1080 at 30 fps, H.264 + AAC), with the README GIF cut from 26.5 to 37 s. Last updated 2026-11-05.

## Concept

A cursor becomes a film: the sound arrives first, the picture is cut to it and measured, and it is released at dawn.

One point of light carries it. It is born from the caret, draws the score, marks every cut, is matched against a reference, and rises as the dawn. Warm means the light (the work), cool blue means the reference.

## Chapters

| Time | Stamp | What happens |
| --- | --- | --- |
| 0 – 5.5 | open | From black, a caret low left. "make it cinematic" is typed by a person (uneven key times). The caret folds into a point of light and glides to the centre. |
| 5.5 – 13 | sound | The score's own waveform opens outward from the light. "It starts with the sound." |
| 13 – 21 | cut | A tick rises at every chord of the score; four shots (viewfinder corners) hang in depth above them; the camera dollies, then pushes in. "Every cut lands on the score." |
| 21 – 28 | match | One viewfinder on the right, a dashed reference arc. The light chases a blue reference ring three times, late and with the wrong ease, then exactly. "Every move is checked against its reference." The frame dims; the light sinks to the horizon. Near silence. |
| 28 – 37 | dawn | The impact: the letterbox opens, warm light from below, the waveform flattens into the horizon, the light rises. "Film Director", "Cinematic films, made as code.", the URL with the caret blinking after it. Fade to black. |

## Voice

None. One caption at a time.

## Art direction

- Ground and grade: blue hour (`bg` #17243D) with a pool of lighter blue that follows the light from scene to scene, warming at dawn.
- Camera: one continuous camera that breathes (seeded noise) and drifts slightly forward; letterbox 2.39:1 until the payoff.
- Atmosphere: 72 dust motes at three depths, cool and warm, blurred by depth.
- Type: Instrument Serif (title, captions), Inter (the line), JetBrains Mono (only what is typed and the URL).

## Sound

- Score: composed by `compose.py` from `score.json`. D minor (Dmadd9, Bbmaj7, F/A, Gm, Dm, Bbmaj7, Csus4, A) lifting to D major (Dadd9, Bbmaj7, Dadd9) at 28 s. Piano alone first, strings from 5.5, cello from 13, bass from 21, horn and choir at the payoff. The horn takes the motif (A4, F4).
- Silence before the hit: the piano drops out at 26.5 and the bed falls to about -40 dB from 27.1 to 27.85, then a lift of about 19 dB on 28.0 (`listen.py --moments 28`).
- Hits and Foley: none (house rule: no whoosh on cuts).
- Mix: music only, -16 LUFS integrated (measured -16.5), true peak -2.0 dBTP. Brightness about 1380 Hz (warm).

## Review and gates

- Design meter: started at "model default" (3 signals: near black with one accent, two colours, same composition). After blue hour, the moving light pool, the warm halo and the atmosphere: 2 signals. The remaining two come from the letterbox (it counts as centred mass; without it the spread is 0.048 against 0.05) and the deliberately restrained palette.
- Independent review: 13 FIX on the first sheet. Fixed: captions and URL larger, scene 3 thinned (four shots, dimmer ticks, muted waveform), boxed cards replaced by viewfinder corners, the caret returns after the URL so the end answers the opening, shorter final fade. Kept on purpose: the empty first frame (fade from black), the repeated light (the motif), scene 3 opening on scene 2's image (one continuous camera).
- QA gate (`qa.py --lufs -16`): pass, 0 FAIL, 1 WARN (long static stretch: slow drift measures as still; expected on a contemplative film).
- Direction chosen by the agent (option A of two); the request delegated it.

## Rejections

| Date | What was rejected | Said | What replaced it |
| --- | --- | --- | --- |
| 2026-11-05 | Near black ground | design meter: model default | Blue hour ground with a light pool that follows the motif |
| 2026-11-05 | Boxed translucent cards | reviewer: looks like a UI mock | Viewfinder corners |
| 2026-11-05 | Automatic whoosh on every cut | house rule | No cut sound |

## Commands (from this folder, after `bash ../../skills/film-director/scripts/install.sh`)

```bash
npm install
uv run ../../skills/film-director/scripts/compose.py score.json -o public/audio/music.wav
E=../../skills/film-director/vendor/extreme-motion-design/skills/extreme-motion-design
uv run $E/scripts/score.py
uv run $E/scripts/mix.py public/timeline.json
npx remotion studio                                  # live preview
node $E/scripts/stills.cjs Film --timeline public/timeline.json --scale 0.5
node $E/scripts/render.cjs Film
uv run $E/scripts/deliver.py out/render.mp4 -o out/final.mp4
uv run $E/scripts/qa.py out/final.mp4 --profile youtube --lufs -16 --timeline public/timeline.json
```

## Cost

| Date | What | Credits |
| --- | --- | --- |
| 2026-11-05 | Everything | 0 (score composed locally, no voice) |

## Files

- `score.json` the music. `roteiro.json` the clock. `direction.json` the direction contract.
- `src/film/Film.tsx` layers, camera, letterbox, light pool. `Opening.tsx` open and sound. `Frames.tsx` cut and match. `Dawn.tsx` the end card. `parts.tsx` the light, atmosphere, waveform, caption, corners.
