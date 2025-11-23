# n00menon Docs

A tiny Node/TypeScript demo service exposing two APIs:

- `ping(): string` → "pong"
- `greet(name: string): string` → "Hello, <name>!"

## Getting Started

```bash
pnpm install
pnpm test
pnpm build
node dist/index.js
```

## API Reference

- Hand-authored summary: [api.md](./api.md)
- Generated Typedoc: open `docs/api/index.html` after running `pnpm run docs:build`.

## Contributing
- Keep exports in `src/index.ts` minimal and documented with TSDoc comments.
- Add tests in `tests/` and keep coverage ≥80% (Vitest threshold enforced).
- Run `pnpm run docs:build` to refresh API docs before tagging.
