# n00menon

Tiny Node/TypeScript demo service exposing `ping` and `greet`, kept here as a sanity target for the wider workspace.

## Quick start

```bash
pnpm install
pnpm test
pnpm build
node dist/index.js
```

## Docs
- Handwritten: `docs/index.md`, `docs/api.md`
- Generated API docs: run `pnpm run docs:build` then open `docs/api/index.html`

## What lives here
- `src/index.ts` — runtime exports and a tiny CLI entry.
- `tests/` — Vitest smoke coverage for ping/greet.
- `tsconfig.json` — ESM build targeting Node 24+.
- `vitest.config.ts` — test + coverage thresholds.

## Maintenance
- Toolchain: Node 25.x, pnpm 10.23.0, TypeScript 5.9.
- CI hook suggestion: run `pnpm test` on PRs; fail if coverage drops below 80%.
