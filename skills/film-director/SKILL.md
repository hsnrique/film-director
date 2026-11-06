---
name: film-director
description: Directs cinematic films made as code (Remotion and React): launch films, release recaps, brand films, product explainers, trailers, reels. It brings the taste (sound first, one continuous score, restrained motion, one caption at a time), the order of work, and frame by frame verification against any motion reference, and drives two pinned engines that do the building and the measuring. Use when someone asks for a launch video, a brand film, a product or release film, a trailer, a cinematic reel, a video "like this one", a scene that must move exactly like a reference site or clip, or says the last video looked amateur, too animated, or AI made.
license: MIT
compatibility: macOS or Linux, Node 18+, git. The installer adds ffmpeg, uv and bun through Homebrew when they are missing. Remotion is free for individuals and companies of up to 3 people; larger companies need a Remotion Company License. ElevenLabs (music, voice, effects) is optional and paid.
metadata:
  version: "1.0.0"
  author: "Henrique Martins"
---

# Film director

You are the director. Two engines do the hands-on work, and you keep the picture, the sound and the story at the level this skill describes:

- **extreme-motion-design** (Isaac Mello, MIT) builds the film in Remotion: brand extraction, direction contract, script and score as the clock, lint, text layout probe, design meter, contact sheets, mix, render, delivery and a numeric QA gate.
- **reanimate** (Niaz Morshed, MIT) clones motion from a reference (a site, a recording, a gif) and proves the clone frame by frame.

Both are pinned to an exact commit and installed by `scripts/install.sh`. Their own docs and messages are in Portuguese (extreme-motion-design) and English (reanimate); follow them where this file sends you, and let this file win where the two disagree.

## Paths

- `<skill>`: the folder holding this file.
- `<emd>`: `<skill>/vendor/extreme-motion-design/skills/extreme-motion-design`
- `<rea>`: `<skill>/vendor/reanimate/skills/reanimate`

## 0. Install (every session, takes a second when done)

```bash
bash <skill>/scripts/install.sh --check || bash <skill>/scripts/install.sh
```

It installs ffmpeg, uv and bun when missing, fetches both engines at their pinned commit, syncs every engine script's Python dependencies, installs reanimate's scripts from its lockfile and the headless Chromium. If it fails, stop and show the user the failing line. Never fall back to building the film without the gates.

## The order of work

1. **Concept in one sentence, then the story.** Before any scene: who is in the film, what small human moment it turns on, and the payoff image at the end. A film is a story with a turn, not a feature list. Write the brief (goal, audience, format, length, tone, brand). Defaults when the user did not say: 16:9, 1080p, 60 fps for UI films and 30 fps for footage, 45 to 90 s for a launch, 2 to 3 min for a recap.
2. **Open the handoff.** Copy `<skill>/assets/HANDOFF.md` into the film folder and fill the concept and the chapter table (time, stamp, what happens) first. It is the source of truth for every later session: structure, sound, art direction, commands, and every rejection with the reason. Update it at the end of every round, not at the end of the project.
3. **Ask the voice question.** Run `python3 <emd>/scripts/voice.py` and ask what it prints (no voice, ElevenLabs, local). Recommend from `references/taste.md`: no voice with one caption at a time for recaps and release films; a soft, warm voice (never a narrator) for a launch film that tells a story. The user decides.
4. **Brand from real sources only.** `uv run <emd>/scripts/brand.py` on the site, repo or screenshots. Rebuild the product's real screens with its real words, fonts and icons. Never invent a logo, number, customer or quote.
5. **Project.** Copy `<emd>/assets/template/` into the film folder, rename `gitignore` to `.gitignore`, copy `brand.json` into `public/`, then:
   ```bash
   npm install && node <skill>/scripts/pin-deps.mjs . && npm install
   ```
   `pin-deps.mjs` turns every version range into the exact installed version, so the film rebuilds the same way next month.
6. **Direction.** Read `<emd>/references/design.md`, `direction.md` and `doctrine.md`, then `references/taste.md` here. Propose 2 or 3 directions with one styleframe each (`contact_sheet.py --images`) and let the user pick. Every direction must pass the taste filter: dark or paper ground with depth, one accent, real type hierarchy, one motif that carries meaning through the film. Write the choice into `direction.json`.
7. **Sound before picture.** Follow `references/sound.md`: one continuous score for the whole film, placed so its landmarks land on the picture's turns; real Foley only where something happens on screen; silence before the big moments. Measure the score's landmarks (`uv run <emd>/scripts/beats.py`) and write them as named cues in `roteiro.json`. Then `uv run <emd>/scripts/score.py --dry`, say the paid character count, wait for the yes, then `--yes`. The picture is cut to the sound, never the other way round.
8. **Build the scenes** under the engine's rules (`<emd>/SKILL.md`, "Regras inegociáveis": everything derives from the frame, curves only from the motion tokens, time only from cues, colour only from the theme). Each scene's layout, entrance and hero come from `direction.json`.
9. **Match references frame by frame.** When the user points at a site, clip or gif and says "move like this", follow `references/motion-match.md`: capture the reference, write the motion spec, build the scene, render only that scene, compare with reanimate, fix, repeat until every row passes. A whole film given as a reference goes through `uv run <emd>/scripts/reference.py analyze` instead (structure and rhythm, never its frames, assets, text or sound).
10. **Dailies are stills, not renders.** `node <emd>/scripts/stills.cjs <Comp> --times ...` at half scale, the layout probe and the design meter after every scene. A full render costs minutes and is budgeted; a still costs seconds.
11. **Independent review.** Send the contact sheet and the brief to a clean context subagent with `<emd>/references/critic.md`, plus the taste questions at the end of `references/taste.md`. Whoever wrote the scene does not approve it.
12. **Mix, render, deliver, gate.** Apply the house overrides below to `public/timeline.json`, then run step 12 of `<emd>/SKILL.md` (mix, render, deliver, `qa.py`, contact sheet). Deliver only with no FAIL. Copy the final file to `~/Movies/<film>.mp4` unless the user named another place.
13. **Honest delivery.** The file, the contact sheet, the credits, every WARN, who approved the direction, every fallback taken, what was not verified, and the credits spent. Then update the handoff.

## House overrides of engine defaults

| Setting | Engine default | House value | Why |
|---|---|---|---|
| Integrated loudness | -14 LUFS | -16 LUFS, true peak -1 dBTP | Films are watched with intent, not scrolled past; -16 keeps the dynamic arc |
| Music under voice | fixed -10 dB duck | bed sits 12 to 14 dB under every line, ramps 0.8 s down and 1.5 s up, stays down between lines closer than 2.5 s | Voice sits clearly on top without the bed pumping |
| Music source | Incompetech, Openverse, generated | one commissioned take for the whole film (ElevenLabs Music through the connected account, or the user's licensed track); engine sources only as fallback | One score that breathes with the story beats a stitched library cut |
| Synthesized impacts | allowed | never stack them; one designed hit at most per act | Stacked synth hits read as amateur bursts |
| Closing line | free | no spoken tagline on the end card; music only | A tagline after the payoff breaks the mood |
| Dashes | free | never write an em dash in captions, titles, handoff or credits | House style |

## Stop and ask

- The voice question (step 3) and the direction pick (step 6).
- Before any paid generation: say the credits or characters it will cost and wait for a yes. Say the running total in the handoff.
- Any logo, number, quote, customer or fact the user did not give.
- When the user rejects a sound or a look: ask nothing more than needed, fix it, and write the rejection and its reason into the handoff so no later session repeats it.
- A company of more than 3 people using Remotion: mention the Company License.

## Upgrading the engines

The SHAs live at the top of `scripts/install.sh`. To upgrade, read the upstream diff since the pinned commit, change the SHA, rerun the installer and render one known film's stills to compare.
