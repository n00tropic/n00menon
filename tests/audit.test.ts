import { describe, it, expect } from "vitest";
import { auditDocs } from "../src/lib/audit";

describe("Audit", () => {
  it("should be defined", () => {
    expect(auditDocs).toBeDefined();
  });
});
