import { describe, expect, it, vi } from "vitest";
import { fileURLToPath } from "node:url";
import { runDemo } from "../src/index";

describe("runDemo", () => {
  it("prints demo banner and greetings", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    runDemo();

    expect(spy).toHaveBeenCalledWith("Demo Node Service is running!");
    expect(spy).toHaveBeenCalledWith("pong");
    expect(spy).toHaveBeenCalledWith("Hello, World!");

    spy.mockRestore();
  });

  it("exercises CLI branch when executed directly", async () => {
    const originalArgv = [...process.argv];
    const entryPath = fileURLToPath(new URL("../src/index.ts", import.meta.url));
    process.argv[1] = entryPath;

    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Import with a query string to bypass ESM cache and trigger the top-level guard
    await import("../src/index.ts?cli");

    expect(spy).toHaveBeenCalledWith("Demo Node Service is running!");

    spy.mockRestore();
    process.argv = originalArgv;
  });

  it("skips CLI branch when no script argument is present", async () => {
    const originalArgv = [...process.argv];
    process.argv = [originalArgv[0]]; // drop argv[1]
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    await import("../src/index.ts?noscript");

    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
    process.argv = originalArgv;
  });
});
