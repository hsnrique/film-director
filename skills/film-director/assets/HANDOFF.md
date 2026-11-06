# <Film title>

Status: <draft | rough cut | final>. Output: `~/Movies/<film>.mp4` (<length>, <resolution><fps>). Last updated <YYYY-MM-DD>.

## Concept

<One sentence: who, the small moment, the turn, the payoff image.>

<Two or three lines on the motif and what each colour means.>

## Chapters

| Time | Stamp | What happens |
| --- | --- | --- |
| 0 – 6.5 | | |

## Voice

<None, or: voice name and id, model, takes per line, and the table below.>

| id | at (s) | room (s) | take | line |
| --- | --- | --- | --- | --- |

## Art direction

- Ground and grade:
- Camera:
- Type:
- Real screens rebuilt:

## Sound

- Score: <source, prompt, takes, chosen take, where its landmarks land>
- Hits:
- Foley:
- Mix: <bed under voice in dB, loudness and true peak measured>

## Rejections

| Date | What was rejected | Said | What replaced it |
| --- | --- | --- | --- |

## Commands (from this folder)

- Preview: `npx remotion studio`
- Stills: `node <emd>/scripts/stills.cjs <Comp> --timeline public/timeline.json`
- Mix: `uv run <emd>/scripts/mix.py public/timeline.json`
- Full film: `node <emd>/scripts/render.cjs <Comp>`
- Deliver and gate: `uv run <emd>/scripts/deliver.py out/render.mp4 -o out/final.mp4` then `uv run <emd>/scripts/qa.py out/final.mp4 --timeline public/timeline.json`

## Cost

| Date | What | Credits |
| --- | --- | --- |

## Files

- `roteiro.json` the clock: scenes, cues on the score's landmarks.
- `direction.json` the direction contract.
- `src/` scenes.
