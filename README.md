# Thulak: The Forbidden Grimoire

## Introducao em Portugues

`Thulak: The Forbidden Grimoire` e um jogo narrativo de fantasia sombria, feito para
rodar no terminal com atmosfera old school, inspirado em livros-aventura, RPGs
em texto e experiencias que lembram a era do DOS. O jogador acompanha Thulak,
um jovem meio-elfo e mago novato, enquanto ele e atraido por um grimorio de
necromancia e por uma trilha que pode leva-lo a um artefato chamado `Gema Azul`.

O projeto possui duas experiencias paralelas:

- uma versao `CLI`, pensada para terminal e imersao ASCII;
- uma versao `web`, pensada para browser e deploy facil.

## Introduction in English

`Thulak: The Forbidden Grimoire` is a dark fantasy narrative game designed to feel like
an old-school terminal adventure. It draws inspiration from gamebooks, classic
text RPGs, DOS-era atmosphere, ASCII art, ANSI interfaces, and the charm of
fiction experienced through typed choices and imagination.

The project currently offers two parallel experiences:

- a `CLI` version for terminal-first immersion;
- a `web` version for browser-based access and static deployment.

---

## What This Project Is

This repository contains the foundation of a branching narrative RPG centered on
`Thulak`, a young half-elf mage whose life is permanently altered by a forbidden
grimoire, the seduction of necromancy, and the growing legend of the `Blue Gem`.

The game is intentionally built as:

- `terminal-first`: the CLI version is part of the artistic identity;
- `story-driven`: the narrative graph is the core system;
- `AI-friendly`: the repository is structured so AI coding agents can expand it;
- `bilingual`: the game currently supports `pt-BR` and `en`;
- `expandable`: story content, visuals, and web delivery are separated cleanly.

This is not yet a full long-form RPG campaign. It is an actively growing
project with a playable first chapter, documented campaign structure, a browser
build, and a content pipeline meant to scale.

## Core Experience

The intended feeling of the project is:

- opening a terminal and seeing a fake DOS-like fantasy interface;
- reading dramatic, horror-leaning narrative scenes;
- making numbered choices like a gamebook;
- watching ASCII and ANSI-style loops animate while deciding;
- optionally using a `d6` to interpret risk, courage, resistance, and combat;
- slowly shaping which version of Thulak the player is becoming.

The tone is dramatic, melancholic, and eerie. Necromancy is presented not only
as evil, but as temptation: permanence, power, grief, denial, and the promise
of victory over death.

## Story Premise

Thulak is a `20-year-old half-elf`, a novice mage, and the late Master Edrin's
last student. On the day he plans to leave his village and begin his own life,
a dead traveler is found on the road. Inside the traveler's chest lies a black
grimoire that seems less like an object and more like an answer to something
Thulak was never meant to say aloud.

That answer is simple and poisonous:

`If death can be studied, perhaps it can be defeated.`

From there, the story opens into catacombs, dungeons, forgotten ritual sites,
ancient history, undead horror, and the long shadow of the `Blue Gem`.

## Campaign Structure

The current campaign is planned as `5 chapters`:

1. `Introduction to the Journey`
   Thulak's origin, the grimoire, grief, and the first threshold.

2. `The Catacombs`
   Funerary passages, sealed dead, clues, and item-based progression.

3. `Within the Dungeons`
   Greater physical danger, sentinels, traps, and more aggressive routes.

4. `The Hidden Secrets of a Millennial Past`
   Ancient truth, war memory, forgotten history, and revelations about the Blue Gem.

5. `Necromancy and Its Horrors`
   The final chapter of this campaign arc, centered on escape from the temple
   and the millennial library after the worst forces have awakened.

Important campaign rule:

- players always begin in `Chapter 1`;
- `Chapters 2, 3, and 4` may branch and connect in different orders;
- some routes may jump from `1` directly into `3` or `4`;
- `Chapter 5` is always the final chapter of this campaign arc.

At the moment, `Chapter 1` is implemented as the first playable major segment,
while the later chapters are already documented and scaffolded as part of the
story architecture.

## Current Features

### CLI

- language selection before the opening screen;
- DOS-inspired terminal presentation;
- ASCII and ANSI-style visuals;
- looping scene animations;
- numbered choice navigation;
- optional PC-speaker-style beeps;
- bilingual text in `pt-BR` and `en`.

### Web

- browser version in the `site/` folder;
- static site architecture for easy deployment;
- same narrative base as the CLI version;
- old-school visual direction preserved in the browser.

### Narrative System

- branching scene graph;
- item-based choice conditions;
- flags and consequences;
- multiple chapter-ending outcomes already implemented;
- optional `d6`-guided play style documented through advanced rules.

## Repository Structure

```text
.
├── AGENTS.md
├── docs/
├── prompts/
├── scripts/
├── site/
├── story/
├── src/
├── package.json
└── vercel.json
```

### Important folders and files

- `src/lib/game.js`
  CLI engine: rendering, input, menu flow, looping animations, and sound.

- `src/lib/content.js`
  Story graph, chapter structure, scenes, choices, conditions, and effects.

- `src/lib/locales.js`
  Localized strings for `pt-BR` and `en`.

- `src/lib/art.js`
  ASCII art and frame-based animations.

- `site/`
  Browser version of the project.

- `story/`
  Human-friendly writing workspace for drafting chapters, scenes, and decisions
  before converting them into the playable graph.

- `scripts/check.js`
  Validation script for story graph integrity and localization consistency.

- `scripts/story-summary.js`
  Chapter and scene summary printer.

- `scripts/build-site-data.js`
  Generates the shared data consumed by the web build.

- `docs/story-background.md`
  Canonical story background.

- `docs/narrative-design.md`
  Narrative design principles, tone rules, d6 guidance, and progression logic.

- `docs/chapter-structure.md`
  The official 5-chapter campaign structure.

- `docs/web-deploy.md`
  Notes about the browser version and static deployment.

- `docs/vercel-deploy.md`
  Vercel-specific deployment notes.

## How to Run

### CLI version

```bash
npm start
```

### Browser version

```bash
npm run site:serve
```

The local site runs at:

```text
http://127.0.0.1:4173
```

## Validation and Utility Commands

### Validate the project

```bash
npm run check
```

This checks:

- duplicate scene IDs;
- duplicate chapter IDs;
- missing `goto` destinations;
- missing `chapterId` references;
- missing art or animation references;
- missing localization keys in `pt-BR` and `en`;
- invalid chapter graph references.

### Print the current story summary

```bash
npm run story:summary
```

### Generate browser shared data

```bash
npm run site:prepare
```

## Deployment

The browser version is prepared for static hosting.

### Vercel

This repository includes:

- `vercel.json`
- `site/` as the web output directory
- a build command that generates the browser data bundle before publish

Typical deployment flow:

```bash
npm run site:prepare
vercel
```

Production deployment:

```bash
vercel --prod
```

### Other static hosts

Because the web build is static, you can also publish the `site/` folder with:

- GitHub Pages
- Netlify
- Cloudflare Pages
- any static file host

## Advanced Rules and d6 Play

The game can be played in two modes:

- `free mode`: players simply choose what Thulak does;
- `d6 mode`: players roll a six-sided die and interpret outcomes through the scene.

Suggested d6 reading:

- `1-2`: failure, hesitation, or heavy cost;
- `3-4`: partial success, moderate cost, or unsettling discovery;
- `5-6`: clear success, advantage, or escape from something worse.

The die is optional, but the design direction for future chapters assumes that
items may provide narrative advantages in `d6 mode`.

Examples of future item-gated progression:

- keys opening hidden chambers;
- encoded manuscripts revealing ritual passwords;
- seals protecting against mental intrusion;
- relics enabling mercy, clarity, or resistance choices;
- tools that unlock routes not available otherwise.

## AI-Friendly Workflow

This repository is intentionally friendly to AI-assisted development.

See:

- `AGENTS.md`
- `prompts/quick-start.md`

Those files explain:

- how to understand the project quickly;
- where to edit story, visuals, and engine behavior;
- how to validate the game after changes;
- how to interpret vague requests like "run the project and make it better."

## What You Can Do With This Repository

If you find this project interesting, you can:

- run it locally and play through the current story;
- expand the narrative graph with new scenes and endings;
- build the missing chapters;
- adapt the story into your own language;
- improve the web version;
- create new ASCII art and animations;
- fork it and turn it into your own terminal-first narrative RPG.

## Status

Current state:

- `Chapter 1` is implemented and playable;
- the 5-chapter campaign structure is defined;
- the web build is operational;
- Vercel deployment is configured;
- the repository is ready for expansion.

## License and Reuse

No explicit license has been added yet.

If you want this project to be openly reused, remixed, or extended by the
public, the next recommended step is to add a proper license file.
