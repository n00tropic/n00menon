# n00menon Docs

Tiny Node/TypeScript demo service that exposes two trivial APIs and acts as a canary for the wider workspace tooling.

## Quick start

```bash
pnpm install
pnpm test
pnpm build
pnpm run docs:build
node dist/index.js
```

## API surface

- `ping(): string` → returns `"pong"`; use as a health probe.
- `greet(name: string): string` → returns `"Hello, <name>!"`.

## Repository map

- `src/index.ts` — runtime exports and the tiny CLI entrypoint.
- `tests/` — Vitest smoke coverage; keep the threshold at ≥80%.
- `docs/` — canonical Markdown docs plus generated Typedoc HTML under `docs/api/`.
- `modules/ROOT/pages/index.adoc` — Antora page (synced automatically; do not hand-edit).
- `package.json` — scripts for build, tests, docs sync, and validation.

## Deployment

### GitHub Pages

API documentation is automatically deployed to GitHub Pages on every push to `main`.

**Setup:**

1. Enable GitHub Pages in your repository settings:
   - Go to **Settings → Pages**
   - Set source to **GitHub Actions**

2. The `deploy-pages.yml` workflow will:
   - Build TypeScript source
   - Generate TypeDoc API documentation
   - Deploy to `https://<org>.github.io/n00menon/`

**Manual deployment:**

```bash
# Trigger deployment manually via GitHub Actions
gh workflow run deploy-pages.yml
```

**Local preview:**

```bash
pnpm run docs:build
npx serve docs/api
```

### Docker

n00menon provides Docker support for containerized deployment.

#### Quick start with Docker

```bash
# Build the image
docker build -t n00menon .

# Run the container
docker run -p 3000:3000 n00menon

# Or build and run in one command
docker-compose up --build
```

#### Docker Compose profiles

```bash
# Production mode (default)
docker-compose up

# Development mode with hot-reload
docker-compose --profile dev up

# Documentation server (serves TypeDoc output)
docker-compose --profile docs up

# Run in background
docker-compose up -d
```

#### Environment variables

| Variable    | Default      | Description                   |
| ----------- | ------------ | ----------------------------- |
| `PORT`      | `3000`       | Port for production service   |
| `DEV_PORT`  | `3001`       | Port for development service  |
| `DOCS_PORT` | `8080`       | Port for documentation server |
| `NODE_ENV`  | `production` | Node environment              |

#### Multi-stage build

The Dockerfile uses multi-stage builds for optimal image size:

1. **builder** — Installs dependencies and compiles TypeScript
2. **production** — Minimal runtime image (~50MB)
3. **development** — Full dev environment with hot-reload

#### Docker commands

```bash
# Build production image
pnpm run docker:build

# Run production container
pnpm run docker:run

# Build and run with compose
pnpm run docker:up

# Stop containers
pnpm run docker:down

# View logs
docker-compose logs -f
```

## Docs + automation

- Edit `docs/index.md` as the single source of truth for n00menon docs.
- Run `pnpm run docs:sync` (or `pnpm -C n00menon run docs:sync` from the workspace root) to refresh `README.md` and the Antora page.
- Regenerate API HTML with `pnpm run docs:build` (or `pnpm -C n00menon run docs:build`).
- CI uses `pnpm run validate` (or `pnpm -C n00menon run validate`) to guard drift and keep the docs build green.

## Contributing

- Keep exports in `src/index.ts` documented with TSDoc comments.
- Add tests in `tests/` for new behaviour; hold coverage at 80% or higher.
- Use pnpm 10.23.0 and Node 24.11+; run `pnpm test` and `pnpm run validate` before raising a PR.
