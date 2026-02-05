# Golden Path: n00menon (Docs SSoT)

> **Quick Ref**: `AGENTS.md` is the primary agent-facing reference; this file summarises the happy-path workflow.

## 1. Prerequisites

```bash
source ../../scripts/ensure-nvm-node.sh
pnpm install
```

## 2. Develop

- Edit source in `src/`.
- Update docs in `docs/`.

## 3. Validate

```bash
pnpm run validate
pnpm test
pnpm run docs:build
```

## 4. Integrate

```bash
# Sync docs from workspace
../scripts/sync-n00menon-docs.mjs --write
```

## 5. Key Documents

| Document          | Purpose                 |
| ----------------- | ----------------------- |
| `AGENTS.md`       | Agent-facing SSoT       |
| `CONTRIBUTING.md` | Contribution guidelines |
| `README.md`       | Project overview        |

---

Last updated: 2025-12-01
