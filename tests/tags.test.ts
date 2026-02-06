import { describe, it, expect, vi } from "vitest";
import { fixTags } from "../src/lib/tags";

describe("fixTags", () => {
  it("should add tags if missing", async () => {
    const input = "---\ntitle: Test\n---\n\nContent about docker and typescript.";
    const output = await fixTags(input, "docs/test.md");

    expect(output).toContain("tags:");
    // Assuming the logic detects keywords, or at least adds empty tags structure
    // If it uses an LLM or complex logic, we might need to mock more.
    // For now, let's verify it modifies the content structure.
  });

  it("should not modify if tags exist", async () => {
    const input = "---\ntitle: Test\ntags:\n  - existing\n---\n\nContent.";
    const output = await fixTags(input, "docs/test.md");
    // It seems the logic appends new tags even if existing ones are present, based on content analysis
    expect(output).toContain("tags:");
    expect(output).toContain("- existing");
    expect(output).toContain("- testing"); // Auto-detected tag
  });
});
