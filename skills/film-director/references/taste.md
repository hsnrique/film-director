# Taste

The level this skill aims at, written as rules with the reason behind each. Most of these come from real rejections: a film was made, watched, and a part of it was called amateur, childish or AI made. The rule is what fixed it.

## The one idea

Cinematic, immersive, restrained. It starts with the sound. Trailer language over explainer language: slow strings, felt piano, real silence before a big moment, a dynamic arc that builds and releases. "Light" means mature and calm, never cute.

## Story

- One concept sentence. A person, a small moment, a turn, a payoff image. The product appears as the thing that makes the turn possible, not as the subject.
- The payoff returns to the opening image, changed (the list from the first shot, now with a live dot next to one line).
- One motif carries meaning through the whole film, and each colour means one thing (white works, green is live, amber waits for you). Never decorate with a meaning you did not set up.
- Recaps and release films: one chapter per release or milestone, a typed stamp per chapter (day, date, version) and one caption at a time. No narration explaining what is on screen.
- End card: the glyph, the name, one line, the URL. Silent but for the music.

## Picture

- One continuous camera that breathes slightly (seeded noise). It never shakes and never whips without a reason.
- Depth: elements hang at different depths with their own blur, and the camera moves through them. Flat cards sliding in from the side read as a template.
- The product's real screens rebuilt faithfully, at 2x, with its real words. Fake UI with lorem copy is the fastest way to look AI made.
- A grade that tells time: cool at night, warm at dawn. Grain and vignette at low strength.
- Letterbox (2.39:1) for the cinematic acts, opening to 16:9 at the payoff, is a strong turn. Use it once.
- Never: full screen purple gradients, generic glow, everything centred, everything fading in, emoji, stacked same size cards, bounce or elastic easing.

## Motion

- One primary action at a time. Arrivals hold 0.4 to 0.8 s. A pause before every climax.
- Typing is typed by a person: uneven key times, real key sounds on each press, the score easing down while a line is typed.
- Overshoot once per scene at most, on the hero only.
- Motion that must feel like a known reference is matched frame by frame (`motion-match.md`), not eyeballed.

## Words on screen

- One caption at a time, short, in the film's serif or the product's UI face. Readable at phone size.
- Captions in the lower letterbox bar while the bars are on, over the image once the frame opens.
- No em dash anywhere: use a colon, a comma, a period or parentheses.
- With a voice: captions synced word by word to the voice's timing.

## Voice

- Soft, warm, close. Never a narrator, never an announcer.
- Short lines with room around them. An ellipsis is a breath, not a pause in the middle of a thought.
- The voice sits clearly on top of the music (`sound.md`).
- No closing tagline ("Now you can..."). The picture closes the idea.
- Takes are chosen by measurement first (length against its room, pauses, level), then offered for a listen.

## Rejections that set the rules

| What was made | What the user said it felt like | The rule now |
|---|---|---|
| Upbeat synth score with a four on the floor kick, claps and bright arps | too animated | Strings, piano, no drums unless the brief asks for energy |
| Stacked synthesized impacts on every turn | amateur bursts | One designed hit per act, from a real sound, at most |
| A score built from separate cues per act with gaps between them | chopped up | One continuous take for the whole film, bridged, never a dead cut |
| Celesta, marimba, pizzicato in a sunny major key with chimes | a children's film | Piano and strings, minor lifting to major at the payoff, soft low knocks instead of chimes |
| A spoken closing tagline | broke the mood | End card silent but for the music |
| An em dash in a title | hated | Never write one |

## Taste questions for the reviewer

Append these to the critic prompt from the engine:

```
4. Does this film feel cinematic and restrained, or animated and busy? Name the frame that breaks it.
5. Is there any frame that looks like a template or AI made (flat sliding cards, purple glow,
   everything centred, fake UI copy)? Name it.
6. Does the last frame answer the first one?
```
