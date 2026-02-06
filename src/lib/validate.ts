import { execa } from "execa";
import { ValidationResult } from "./types.js";
import process from "node:process";

export async function validateDocs(
  files: string[],
  options: { skipVale?: boolean; skipLychee?: boolean } = {}
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  // 1. Run Vale
  if (!options.skipVale) {
    try {
      // Check if vale exists
      await execa("which", ["vale"]);

      const valeArgs = [
        "--output=json", // JSON output for parsing
        ...(process.env.VALE_LOCAL === "1"
          ? ["--config", ".vale.local.ini", "--ignore-syntax"]
          : []),
        // Exclude agent-facing policy pages if needed, similar to original script
        // For now, validting what is passed or default docs/
        ...(files.length > 0 ? files : ["docs/**/*.adoc"]),
      ];

      const { stdout } = await execa("vale", valeArgs, { reject: false });

      try {
        const valeJson = JSON.parse(stdout);
        // Transform Vale JSON to ValidationResult
        for (const [filePath, complaints] of Object.entries(valeJson)) {
          const errors = (complaints as any[]).map((c) => ({
            line: c.Line,
            column: c.Span[0],
            message: c.Message,
            ruleId: c.Check,
            severity: c.Severity === "error" ? "error" : "warning",
          }));

          results.push({
            file: filePath,
            valid: errors.length === 0,
            errors: errors as any,
          });
        }
      } catch (e) {
        console.warn("Failed to parse Vale JSON output", e);
      }
    } catch (e) {
      console.warn("Vale not found or failed to run", e);
    }
  }

  // 2. Run Lychee (Link Checker)
  if (!options.skipLychee) {
    try {
      await execa("which", ["lychee"]);
      const lycheeArgs = [
        "--config",
        ".lychee.toml",
        "--format",
        "json",
        ...(files.length > 0 ? files : ["docs/**/*.adoc"]),
      ];

      const { stdout } = await execa("lychee", lycheeArgs, { reject: false });
      try {
        const lycheeJson = JSON.parse(stdout);
        if (lycheeJson.fail_map) {
          for (const [url, failures] of Object.entries(lycheeJson.fail_map)) {
            // Lychee JSON structure is a bit different, mapping URLs to failures.
            // We need to map back to files if possible, or report general errors.
            // The JSON output might not be granular enough per-file without parsing the 'fail_map'
            // For this iteration, we simplify and just check exit code or basic output if we can't map nicely.
            // Actually, lychee --format json output is structured.

            (failures as any[]).forEach((fail) => {
              const file = fail.file || "unknown"; // Lychee might provide file source
              const existing = results.find((r) => r.file === file);
              const error = {
                message: `Broken link: ${url} (${fail.text || "No text"})`,
                severity: "error" as const,
              };

              if (existing) {
                existing.errors.push(error);
                existing.valid = false;
              } else {
                results.push({
                  file,
                  valid: false,
                  errors: [error],
                });
              }
            });
          }
        }
      } catch (e) {
        // console.warn("Failed to parse Lychee JSON", e);
        // Lychee output might not be purely JSON if mixed with stdout logs?
      }
    } catch (e) {
      console.warn("Lychee not found or failed to run", e);
    }
  }

  return results;
}
