# Film Director

<p align="center">
  <a href="docs/media/film-director.mp4"><img src="docs/media/film-director.gif" width="800" alt="The last ten seconds of the README film: after a near silence the letterbox opens, warm light rises from the horizon, and the title Film Director appears with the line Cinematic films, made as code, and the repository URL with a blinking caret"></a>
</p>
<p align="center"><a href="docs/media/film-director.mp4">Watch the full 37 second film with sound</a></p>

The film above was made by this skill, end to end, in one session: the score was composed note by note for the picture, every scene was measured, an independent reviewer sent back 13 fixes, and nothing shipped until the QA gate passed. Its whole source, including the score and the handoff with every decision, is in [`examples/readme-film`](examples/readme-film).

## What it is

A skill that makes coding agents (Claude Code, Codex, anything that reads `SKILL.md`) direct cinematic films as code: launch films, release recaps, brand films, trailers, reels.

Agents can already build video with Remotion. What they lack is taste, an ear, and a way to check their work. Left alone they ship an upbeat stock track, every element fading in, flat cards sliding from the side, a whoosh on every cut, and a tagline nobody asked for. This skill is the director on top of the build:

- **It composes the score.** The agent writes the music for the film, chord by chord and swell by swell, against the film's own cue times, and plays it through sampled piano, strings, cello, horn and choir. Every chord lands on its cut by construction. No stock track, no API credits.
- **It reads sound as numbers.** The agent cannot hear, so `listen.py` shows it the loudness curve, the brightness, the entrances, the silences, and whether every turn of the film has a dip before it and a lift on it.
- **Restrained picture.** One breathing camera through depth, one motif that means something, one caption at a time, the product's real screens with its real words.
- **Live direction.** The film stays open in Remotion Studio while it is made. Ask for any change in plain words ("the payoff feels weak", "slower title") and the agent finds the exact knob, shows a before and after, changes one thing, and records it. Vague requests get two or three concrete options instead of a guess.
- **Frame by frame motion matching.** Point at a site, a clip or a gif and say "move like this": the scene is rendered and compared with the reference frame by frame until timing and easing pass.
- **A handoff that remembers.** Every film keeps a `HANDOFF.md` with its structure, sound, commands and every rejection with its reason, so no later session repeats a mistake.

## Engines

The building and the measuring are done by two MIT licensed skills, pinned to an exact commit and installed by the setup script:

- [extreme-motion-design](https://github.com/dev-isaacmello/extreme-motion-design) by Isaac Mello: Remotion template, direction contract, script and score as the clock, layout probe, design meter, mix, render and a numeric QA gate.
- [reanimate](https://github.com/NiazMorshed2007/reanimate) by Niaz Morshed: capture a reference, write a motion spec, compare the clone frame by frame.

## Install

With the skills CLI:

```bash
npx skills add hsnrique/film-director
```

Or as a Claude Code plugin:

```
/plugin marketplace add hsnrique/film-director
/plugin install film-director@film-director
```

Then install the engines, the instruments and the toolchain once (the agent also runs this itself at the start of a session):

```bash
bash <path-to-skill>/scripts/install.sh
```

It needs macOS or Linux with Node 18+ and git. It adds ffmpeg, uv, bun and fluidsynth through Homebrew when they are missing, fetches both engines at their pinned commit, installs their script dependencies from their lockfiles, and downloads the GeneralUser GS soundfont, checked by SHA-256. `--check` reports without changing anything.

## Use

Ask for the film the way you would ask a director:

> Make a 90 second launch film for our app. Cinematic, no narration, one caption at a time.

> This scene should land exactly like the hero on this page: https://...

> The payoff at 0:28 feels weak.

The agent writes the concept and the chapter table first, asks about voice, proposes directions, composes and measures the score before animating, checks every scene with stills, sends the contact sheet to an independent reviewer, and delivers only after the QA gate passes.

## What is in here

```
skills/film-director/
  SKILL.md                    the order of work and the house overrides
  references/taste.md         the taste, as rules with reasons
  references/sound.md         composing the score, silence, Foley, ducking, master
  references/revisions.md     directing changes live
  references/motion-match.md  frame by frame matching in a Remotion film
  assets/HANDOFF.md           the handoff template
  scripts/install.sh          toolchain, instruments and pinned engines
  scripts/compose.py          writes the score from score.json and plays it
  scripts/listen.py           reads any audio as numbers
  scripts/pin-deps.mjs        pins a film project's dependencies to exact versions
examples/readme-film/         the film at the top of this page, with its handoff
```

## Notes

- Remotion is free for individuals and companies of up to 3 people; larger companies need a [Remotion Company License](https://www.remotion.dev/license).
- ElevenLabs (voice, commissioned music) is optional and paid. The agent says the cost and waits for a yes before any paid generation.
- API keys go in the film project's `.env`, never in chat or in git.

## Tests

```bash
node --test skills/film-director/scripts/*.test.mjs
uv run skills/film-director/scripts/compose_test.py
uv run skills/film-director/scripts/listen_test.py
```

## License

MIT. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the engines, the soundfont and the fonts.
