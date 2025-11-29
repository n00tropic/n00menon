/* eslint-env node */
/* global console, process */
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docsApiDir = path.join(projectRoot, "docs", "api");
const outDir = path.join(projectRoot, "_site");

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>n00menon - API Documentation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      color: #333;
    }
    h1 { color: #2c3e50; }
    a { color: #3498db; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code {
      background: #f4f4f4;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'Fira Code', 'Monaco', monospace;
    }
    pre {
      background: #2c3e50;
      color: #ecf0f1;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
    }
    pre code { background: transparent; color: inherit; }
    .card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
    }
    .card h3 { margin-top: 0; }
  </style>
</head>
<body>
  <h1>🔬 n00menon</h1>
  <p>Tiny Node/TypeScript demo service that exposes two trivial APIs and acts as a canary for the wider workspace tooling.</p>

  <h2>📚 Documentation</h2>
  <div class="card">
    <h3><a href="./api/">API Reference</a></h3>
    <p>Auto-generated TypeDoc documentation for all exported functions and types.</p>
  </div>

  <h2>🚀 Quick Start</h2>
  <pre><code>pnpm install
pnpm test
pnpm build
node dist/index.js</code></pre>

  <h2>📡 API Surface</h2>
  <ul>
    <li><code>ping(): string</code> → returns <code>"pong"</code>; use as a health probe.</li>
    <li><code>greet(name: string): string</code> → returns <code>"Hello, &lt;name&gt;!"</code>.</li>
  </ul>

  <h2>🐳 Docker</h2>
  <pre><code># Build and run with Docker
docker build -t n00menon .
docker run -p 3000:3000 n00menon

# Or use docker-compose
docker-compose up</code></pre>

  <h2>🔗 Links</h2>
  <ul>
    <li><a href="https://github.com/n00tropic/n00tropic-cerebrum/tree/main/n00menon">Source Code</a></li>
    <li><a href="https://github.com/n00tropic/n00tropic-cerebrum">n00tropic Cerebrum Workspace</a></li>
  </ul>

  <footer style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e0e0e0; color: #666;">
    <p>Part of the <a href="https://github.com/n00tropic">n00tropic</a> ecosystem.</p>
  </footer>
</body>
</html>`;

async function main() {
  // ensure docs/api exists
  await fs.stat(docsApiDir);

  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  await fs.cp(docsApiDir, path.join(outDir, "api"), { recursive: true });
  await fs.writeFile(path.join(outDir, "index.html"), indexHtml, "utf8");

  console.log(`Pages artifact created at ${outDir}`);
}

main().catch((err) => {
  console.error("Failed to build pages artifact:", err);
  process.exit(1);
});
