/**
 * Main entry point for Demo Node Service
 */

export function ping(): string {
  return "pong";
}

export function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Demo Node Service is running!");
  console.log(ping());
  console.log(greet("World"));
}
