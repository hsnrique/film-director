# Film Director

A skill that makes coding agents (Claude Code, Codex, anything that reads `SKILL.md`) direct cinematic films as code: launch films, release recaps, brand films, trailers, reels.

Agents can already build video with Remotion. What they lack is taste and a way to check their work. Left alone they ship an upbeat synth score, every element fading in, flat cards sliding from the side, and a tagline nobody asked for. This skill is the director on top of the build:

- **Sound first.** One continuous score for the whole film, placed so its landmarks land on the story's turns, real Foley only where something happens on screen, silence before the big moments, the voice 12 to 14 dB over the bed, mastered at -16 LUFS.
- **Restrained picture.** One breathing camera through depth, the product's real screens rebuilt with its real words, one caption at a time, one motif that means something.
- **Frame by frame motion matching.** Point at a site, a clip or a gif and say "move like this": the scene is built, rendered, and compared to the reference frame by frame until timing and easing pass.
- **A handoff that remembers.** Every film keeps a `HANDOFF.md` with its structure, sound, commands and every rejection with the reason, so no later session repeats a mistake.

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

Then install the engines and the toolchain once (the agent also runs this itself at the start of a session):

```bash
bash <path-to-skill>/scripts/install.sh
```

It needs macOS or Linux with Node 18+ and git, adds ffmpeg, uv and bun through Homebrew when they are missing, fetches both engines at their pinned commit, and installs their script dependencies from their lockfiles. `--check` reports without changing anything.

## Use

Ask for the film the way you would ask a director:

> Make a 90 second launch film for our app. Cinematic, no narration, one caption at a time.

> This scene should land exactly like the hero on this page: https://...

The agent writes the concept and the chapter table first, asks about voice, proposes two or three directions with styleframes, scores the film before animating it, checks every scene with stills, sends the contact sheet to an independent reviewer, and delivers only after the QA gate passes.

## What is in here

```
skills/film-director/
  SKILL.md                 the order of work and the house overrides
  references/taste.md      the taste, as rules with reasons
  references/sound.md      score, silence, Foley, ducking, master
  references/motion-match.md  frame by frame matching in a Remotion film
  assets/HANDOFF.md        the handoff template
  scripts/install.sh       toolchain and pinned engines
  scripts/pin-deps.mjs     pins a film project's dependencies to exact versions
```

## Notes

- Remotion is free for individuals and companies of up to 3 people; larger companies need a [Remotion Company License](https://www.remotion.dev/license).
- ElevenLabs (music, voice, effects) is optional and paid. The agent says the cost and waits for a yes before any paid generation.
- API keys go in the film project's `.env`, never in chat or in git.

## Tests

```bash
node --test skills/film-director/scripts/*.test.mjs
```

## License

MIT. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the engines.
