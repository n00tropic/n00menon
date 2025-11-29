# Golden Path: n00menon (Docs SSoT)

Prereqs
- `source ../scripts/ensure-nvm-node.sh`
- `pnpm install`

Do
- `pnpm run validate`
- `pnpm run docs:build`

Validate
- Antora/TechDocs build passes; lint/tests (if enabled) clean

Integrate
- Run `../scripts/sync-n00menon-docs.mjs --write` from workspace root to pull shared docs in
- Keep ADRs and golden paths mirrored from workspace `docs/modules/ROOT/`
