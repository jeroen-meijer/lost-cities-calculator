# Lost Cities score calculator

**Use it online:** [jeroen-meijer.github.io/lost-cities-calculator](https://jeroen-meijer.github.io/lost-cities-calculator/) — open that link on your phone or desktop any time; it runs in the browser like a normal web app (no install).

> This project was **vibe-coded** with an AI assistant: it was **not** formally reviewed, audited, or battle-tested. The scoring logic has unit tests and **seems** right in practice, but treat it as a convenience tool — double-check scores that matter.

Knizia / Kosmos card game *Lost Cities*: toggle investment cards (X) and expedition numbers per color; the app applies the usual round scoring (expedition cost, wager multiplier, eight-card bonus).

## Development

```bash
npm install
npm run dev
npm run test
npm run build
```

Stack: React, TypeScript, Vite, Tailwind CSS. Deploys to GitHub Pages from the `pages` branch via Actions on push to `main`.
