# Revisions

The film is made with the user, not handed to them. Any change they ask for, in any words, is found, shown, made and proved in minutes, without a full render and without guessing.

## Keep the film live

Open the studio as soon as the first scene exists and leave it running:

```bash
npx remotion studio
```

It reloads on every save. Tell the user the URL and that they can scrub to any second. When they point at a moment, they can say the time ("at 0:21") or describe it ("when the frames appear").

## The loop, for every request

1. **Locate.** Turn the request into a time range and a chapter, using the handoff's chapter table and `public/cues.json`. Say it back in one line: "0:21 to 0:28, the match scene, the arc." If two places fit, ask which one, showing a still of each.
2. **Name the knob.** Find the one place that controls it: a cue in `roteiro.json`, a value in a scene file (file and line), a chord or dynamics key in `score.json`, a colour in `public/brand.json`. Say what will change, from what to what: "`capMatch` from 0.9 s to 1.6 s into the scene."
3. **Before.** Stills at that moment: `node <emd>/scripts/stills.cjs <Comp> --times <t1,t2,t3> --out out/rev-<n>/before`. For sound, the numbers `uv run <skill>/scripts/listen.py public/audio/mix.wav --moments <t>` and a 12 s clip around it for the user's ears: `ffmpeg -ss <t-6> -t 12 -i public/audio/mix.wav out/rev-<n>/before.wav`.
4. **Change the smallest thing**, then the same stills or clip into `out/rev-<n>/after`, and `contact_sheet.py --images` with before and after side by side.
5. **Show both** and ask one question: keep it, or go further in the same direction. A sound change is never "done" until the user has heard the clip: the agent cannot hear.
6. **Record it.** One row in the handoff (date, request in the user's words, the knob, from, to). A rejection also goes in the Rejections table with its reason.

Only rerender the full film when the user is happy with every revision of the round, and only the scenes that changed if the engine allows it (`render.cjs <Comp> --scene <id>`).

## When the request is vague

"Make it better", "more epic", "it feels off". Never guess. Offer two or three concrete options, each tied to a knob and each shown as a still or a clip when it can be:

> More epic, three ways: (A) the horns enter at 0:21 instead of 0:28, (B) a deeper dip before the payoff and a lift 4 dB bigger, (C) the camera push at 0:19 runs twice as long. Which one, or a mix?

## Words to knobs

| The user says | Look at first |
| --- | --- |
| slower, faster, rushed, drags | the cue times and tween lengths of that scene; holds after arrivals (0.4 to 0.8 s) |
| too sad, too happy, too dark | the chords and mode in `score.json` (minor to major lift, where it happens) |
| too busy, too much | the parts in `score.json` `sections`; the number of moving things in the scene; overshoot |
| no impact, flat, weak payoff | the dip before the moment (`dynamics`), the lift on it, the silence length; `listen.py --moments` |
| loud, harsh, tiring | `brightness_hz` from `listen.py`, the horn and choir sections, loudness target |
| cheap, amateur, AI made | `references/taste.md` rejections table; `design.py` signals; fake UI copy |
| can't read it | `layout.py`; caption length against its time on screen; size and contrast |
| it doesn't look like the reference | `references/motion-match.md`, one row of the spec at a time |
| the music doesn't land on the moment | the cue time against `music.landmarks.json`; move the chord in `score.json` or the cue, never both |

## Never

- Change something the user did not ask about in the same revision. One request, one change, one proof.
- Say a sound change works without the user hearing it.
- Rerender the whole film to show a two second change.
