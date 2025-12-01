# n00menon Copilot Guide

> **Agent-facing SSoT**: See `/AGENTS.md` for the authoritative agent reference.
> This file provides Copilot-specific context; AGENTS.md is the primary source for all agents.

- **Mission**: Tiny Node/TypeScript demo service—canary for workspace tooling; docs SSoT for Antora content.
- **Repo layout**: `src/`, `tests/`, `docs/`, `modules/ROOT/`.
- **Runtime**: Node 20+ (CI pins 24).
- **Key automation**: Docs sync, API documentation generation, GitHub Pages deployment.

## Toolchain & Setup

- Install with `pnpm install`.
- Build: `pnpm build`.
- Docs: `pnpm run docs:build`.

## Validation & Tests

- `pnpm test` runs Vitest suites.
- Coverage threshold: ≥80%.
- `pnpm run validate` runs lint and type checks.

## API Surface

- `ping(): string` → returns `"pong"` (health probe).
- `greet(name: string): string` → returns `"Hello, <name>!"`.

## Docs Sync

- Do NOT hand-edit `modules/ROOT/pages/` (synced automatically).
- Run `pnpm run docs:sync` to update from source.
- Preview locally: `npx serve docs/api`.

## Deployment

GitHub Pages deploys automatically on push to `main`:
- TypeDoc API docs → `https://<org>.github.io/n00menon/`.
