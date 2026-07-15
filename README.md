# I LOVE YOU 10,000 - Skills Tracker

A local-first static web app for tracking deliberate practice toward 10,000 hours of mastery in any skill. Progress is logged hour by hour, organized into 100-hour reflection cycles, and stored entirely in the browser. Love is a practice and therefore a discipline.

**Access it here:** [https://yibeisita.github.io/i-love-you-10k/](https://yibeisita.github.io/i-love-you-10k/)

## What it does

- Multi-skill dashboard with color-coded activity logging on a 1–10,000 hour grid
- Setup prompts (purpose, identity, starting point, endurance, non-negotiables)
- 100-hour blocks with start and end reflection journals, plus archived retrospective views
- JSON export/import for backup; no accounts, server, or cloud sync



## Tech

Vanilla HTML/CSS/JS (ES modules, no bundler). State in `localStorage` (`cosmic_multi_10k_state`, `cosmic_multi_10k_prefs`). i18n: English, Spanish, Italian. Tests: Vitest + jsdom (55 tests).

## Run

```bash
npm install
npm start          # http://localhost:3000
npm test           # run once
npm run test:watch # watch mode
```

Serve the repo root as static files to deploy. Any modern browser with ES module and `localStorage` support works.

## Structure

```
index.html          # app shell
css/main.css        # styles
js/                 # state, tracker, blocks, i18n, settings, render, …
tests/              # vitest suites
```

Core state: skills with activities, logged hours, setup prompts, and up to 100 completed 100-hour blocks per skill.

## License and contributing

Licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE). You may use, study, and modify this project for noncommercial purposes. Commercial use and selling products or services based on this project are not allowed without permission.

Contributions via issues and pull requests are welcome. By contributing, you agree your work may be included under the same license. 