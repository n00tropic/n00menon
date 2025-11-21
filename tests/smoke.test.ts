import { describe, it, expect } from "vitest";
import { ping, greet } from "../src/index";

describe("ping", () => {
  it("should return pong", () => {
    expect(ping()).toBe("pong");
  });
});

describe("greet", () => {
  it("should greet by name", () => {
    expect(greet("Alice")).toBe("Hello, Alice!");
  });

  it("should handle empty string", () => {
    expect(greet("")).toBe("Hello, !");
  });
});
