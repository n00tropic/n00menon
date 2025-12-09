/**
 * Main entry point for Demo Node Service
 */

import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export function ping(): string {
  return "pong";
}

export function greet(name: string): string {
  return `Hello, ${name}!`;
}

/**
 * Run the demo service locally: prints health and greeting messages.
 * Separated for testability so coverage can exercise the CLI path.
 */
export function runDemo(): void {
  console.log("Demo Node Service is running!");
  console.log(ping());
  console.log(greet("World"));
}

// Run if executed directly
const isDirectRun = fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "");

if (isDirectRun) {
  runDemo();
}
