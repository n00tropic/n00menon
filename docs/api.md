# API Quick Reference

## ping

Returns the string `"pong"`. Useful as a health probe.

## greet(name: string)

Returns `"Hello, <name>!"`. Pass an empty string to test edge cases.

For full type details and signatures, regenerate and open the Typedoc HTML under `docs/api/`:

```bash
pnpm run docs:build
open docs/api/index.html
```
