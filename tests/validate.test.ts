import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateDocs } from "../src/lib/validate";
import { globby } from "globby";
import { execa } from "execa";
import fs from "node:fs";

vi.mock("globby");
vi.mock("node:fs");
vi.mock("execa");

describe("validateDocs", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(globby).mockResolvedValue(["docs/test.md"]);
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue("---\ntitle: Test\n---\n\nContent");
        // Mock default execa response
        vi.mocked(execa).mockResolvedValue({ stdout: "{}", exitCode: 0 } as any);
    });

    it("should validate valid docs", async () => {
        // Mock valid vale output
        vi.mocked(execa).mockResolvedValue({
            stdout: JSON.stringify({ "docs/test.md": [] }),
            exitCode: 0
        } as any);

        const results = await validateDocs(["docs/test.md"]);
        expect(results).toHaveLength(1);
        expect(results[0].valid).toBe(true);
    });

    it("should fail on empty frontmatter", async () => {
        vi.mocked(fs.readFileSync).mockReturnValue("No frontmatter here");
        // Mock vale complaint
        vi.mocked(execa).mockResolvedValue({
            stdout: JSON.stringify({
                "docs/test.md": [
                    { Line: 1, Span: [1, 1], Message: "Frontmatter missing", Check: "Frontmatter", Severity: "error" }
                ]
            }),
            exitCode: 1
        } as any);

        const results = await validateDocs(["docs/test.md"]);
        expect(results[0].valid).toBe(false);
        expect(results[0].errors[0].message).toContain("Frontmatter missing");
    });
});
