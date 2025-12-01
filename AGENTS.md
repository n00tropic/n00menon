# AGENTS.md

A concise, agent-facing guide for n00menon. Keep it short, concrete, and enforceable.

## Project Overview

- **Purpose**: Tiny Node/TypeScript demo service acting as a canary for workspace tooling; also serves as the docs SSoT for Antora content.
- **Critical modules**: `src/`, `tests/`, `docs/`, `modules/ROOT/`
- **Non-goals**: Do not hand-edit synced files (e.g., `modules/ROOT/pages/index.adoc`); use source sync scripts.

## Ecosystem Role

```text
n00-frontiers (Standards) → n00menon (Docs SSoT/Demo) → GitHub Pages / Antora
```

- **SSoT for**: TechDocs / Antora content.
- **Canary**: Tests workspace tooling (CI, linting, Docker).
- **API surface**: `ping()` → "pong"; `greet(name)` → "Hello, name!".

## Build & Run

### Prerequisites

- Node 20+ (CI pins 24); run `nvm use`
- pnpm 9+

### Common Commands

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build

# Build docs
pnpm run docs:build

# Run the service
node dist/index.js

# Sync docs
pnpm run docs:sync

# Local docs preview
npx serve docs/api
```

### Docker

```bash
# Build image
docker build -t n00menon .

# Run container
docker run -p 3000:3000 n00menon

# Or via compose
docker-compose up --build
```

## Code Style

- **TypeScript**: Strict types; ESLint + Prettier enforced.
- **Tests**: Vitest; maintain ≥80% coverage threshold.
- **Docs**: Markdown source synced to AsciiDoc via scripts.

## Security & Boundaries

- Do not hand-edit synced Antora pages (`modules/ROOT/pages/`).
- Keep test coverage at ≥80%.
- Do not commit credentials or tokens.

## Definition of Done

- [ ] All tests pass (`pnpm test`).
- [ ] Build succeeds (`pnpm build`).
- [ ] Coverage ≥80%.
- [ ] Docs build (`pnpm run docs:build`).
- [ ] PR body includes rationale and test evidence.

## Key Files

| Path                        | Purpose                          |
| --------------------------- | -------------------------------- |
| `src/index.ts`              | Runtime exports + CLI entrypoint |
| `tests/`                    | Vitest smoke tests               |
| `docs/`                     | Markdown docs + generated API    |
| `modules/ROOT/pages/`       | Antora pages (synced)            |
| `package.json`              | Scripts and dependencies         |
| `Dockerfile`                | Container definition             |

## Deployment

### GitHub Pages

Automatic on push to `main`:
1. Build TypeScript
2. Generate TypeDoc API docs
3. Deploy to `https://<org>.github.io/n00menon/`

### Manual Deploy

```bash
gh workflow run deploy-pages.yml
```

## Integration with Workspace

When in the superrepo context:

- Root `AGENTS.md` provides ecosystem-wide conventions.
- Antora content syncs with workspace docs.
- Uses shared trunk/lint configs from root.

---

*For ecosystem context, see the root `AGENTS.md` in n00tropic-cerebrum.*

---

*Last updated: 2025-12-01*
