# Motion match

How a scene is made to move exactly like a reference, with reanimate as the measuring tool. The method is reanimate's (read `<rea>/SKILL.md` and `<rea>/references/verify.md`); this page is how it plugs into a Remotion film.

Use it for one shot or one move: "the logo should land like Apple's", "this hero's stagger", "the first 3 seconds of this clip". For the structure of a whole reference film, use `uv run <emd>/scripts/reference.py analyze` instead.

From a reference take timing, easing, sequence, stagger, distance and layout proportions. Never its frames, assets, logo, copy, music or voice.

## 1. Scope

Write three lines at the top of `match/<name>/spec.md`: target (URL and selector, or file and time range), destination (scene id and composition), fidelity (motion-faithful by default; pixel-faithful only when the user says "exactly", "1:1").

## 2. Capture the reference

```bash
# a clip or gif
bun <rea>/scripts/frames.ts --in ref.mp4 --probe
bun <rea>/scripts/frames.ts --in ref.mp4 --out match/<name>/ref/frames --fps 30 --start 0:03 --end 0:06 --crop x,y,w,h

# a live site
bun <rea>/scripts/capture.ts --url https://... --out match/<name>/ref --selector "<section>" \
  --trigger load --duration 3 --track "<moving elements>"
```

For a site, `inspect.json` often holds the exact durations, delays and easings: use them before estimating. Canvas or WebGL: add `--clock virtual --gl --assets` and read `<rea>/references/webgl.md`.

Then look at every sheet: `bun <rea>/scripts/sheet.ts filmstrip --frames match/<name>/ref/frames --out match/<name>/ref/sheets`.

## 3. Write the motion spec

One row per element per property (trigger, start, duration, delay or stagger, from and to, easing), using the template in `<rea>/references/analysis.md`. A row with a "?" means the frames are not read yet.

## 4. Build the scene in Remotion

Translate each row into the engine's primitives: times become cues relative to the scene, easings become the closest motion token (`easeX.*`, `springs.*`) or a custom `Easing.bezier` taken from `inspect.json`. Keep the rest of the engine's rules (state from the frame only, no CSS transitions).

## 5. Render only that scene, at the reference's fps and crop

```bash
npx remotion render <Comp> match/<name>/clone-1.mp4 --frames=<first>-<last> --codec=h264
bun <rea>/scripts/frames.ts --in match/<name>/clone-1.mp4 --out match/<name>/clone-1/frames --fps 30 --crop x,y,w,h
```

The crop and fps must be the same as the reference's, or the comparison measures the setup instead of the work.

## 6. Compare, fix, repeat

```bash
bun <rea>/scripts/compare.ts --ref match/<name>/ref/frames --clone match/<name>/clone-1/frames --out match/<name>/compare-1
bun <rea>/scripts/sheet.ts compare --ref match/<name>/ref/frames --clone match/<name>/clone-1/frames \
  --diff match/<name>/compare-1/diff --out match/<name>/compare-1/sheets --every 2
```

Motion-faithful passes when start, end and duration are within 0.08 s, the activity curve has the same shape (same easing family and stagger), and the compare sheets show the same state at the same time allowing for different copy and colour. Pixel-faithful adds `--threshold 0.02`. Read the sheets every round: the numbers say something is off, the sheets say what.

Change the smallest thing the evidence points at, then render and compare again. Expect 2 to 5 rounds. After 5, stop and report the failing row with its numbers and the reason; never loosen a threshold to pass.

## 7. Record it

Add the final compare numbers to the handoff under the scene, and keep `match/<name>/` out of git unless the user wants the evidence committed.
