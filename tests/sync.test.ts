import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { syncDocs } from "../src/lib/sync";
import fs from "node:fs";
import path from "node:path";

vi.mock("node:fs");

describe("syncDocs", () => {
  const mockFilePaths = {
    source: "/mock/docs/index.md",
    readme: "/mock/README.md",
    antora: "/mock/modules/ROOT/pages/index.adoc",
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue("# Test Docs\n\nSome content.");
    vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
  });

  it("should sync docs successfully", () => {
    vi.mocked(fs.readFileSync)
      .mockReturnValueOnce("# Test Docs\n\nSome content.") // source
      .mockReturnValueOnce("Old content") // readme
      .mockReturnValueOnce("Old content"); // antora

    const results = syncDocs(mockFilePaths);

    expect(results).toHaveLength(2);
    expect(results[0].synced).toBe(true);
    expect(results[1].synced).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
  });

  it("should detect drift in check mode", () => {
    vi.mocked(fs.readFileSync)
      .mockReturnValueOnce("# Test Docs\n\nNew content.") // source
      .mockReturnValueOnce("Old content") // readme
      .mockReturnValueOnce("Old content"); // antora

    const results = syncDocs(mockFilePaths, { check: true });

    expect(results).toHaveLength(2);
    expect(results[0].synced).toBe(false);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("should throw if source missing", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(() => syncDocs(mockFilePaths)).toThrow("Source file missing");
  });
});
