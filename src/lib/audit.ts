import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { globby } from "globby";
import { ValidationResult, ValidationError } from "./types.js";

// Schemas
const FrontmatterSchema = z.object({
  title: z.string({ required_error: "Title is required" }).min(1),
  type: z.enum(["concept", "guide", "reference", "tutorial", "policy", "adr"]).optional(),
  status: z.enum(["draft", "review", "stable", "deprecated"]).optional(),
  owner: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).passthrough();

export async function auditDocs(
  root: string,
  // options: { fix?: boolean } = {} // Unused for now
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  // 1. Structural Checks
  const structuralResult = checkStructure(root);
  if (structuralResult) results.push(structuralResult);

  // 2. Content Checks (Frontmatter)
  const files = await globby(["**/*.md", "**/*.adoc"], {
      cwd: root,
      ignore: ["**/node_modules/**", "**/dist/**", "**/.*"],
      absolute: true
  });

  for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      const relativePath = path.relative(root, file);
      const errors: ValidationError[] = [];

      try {
          // gray-matter supports YAML frontmatter in Markdown.
          // For AsciiDoc, it's slightly different (attributes header),
          // but we'll assume standard YAML block '---' for now or standard Adoc attributes if we parse manually.
          // Gray-matter is primarily for YAML/JSON fenced blocks.

          if (file.endsWith(".md")) {
              const { data } = matter(content);
              const parseResult = FrontmatterSchema.safeParse(data);

              if (!parseResult.success) {
                  parseResult.error.errors.forEach(e => {
                      errors.push({
                          message: `Frontmatter: ${e.path.join(".")} - ${e.message}`,
                          severity: "error",
                          ruleId: "frontmatter-schema"
                      });
                  });
              }
          }
           // AsciiDoc typically uses :attribute: value, which matter doesn't handle natively without config.
           // Leaving AsciiDoc frontmatter check as a TODO or implementing basic attribute regex Check.

      } catch (e: any) {
           errors.push({
               message: `Failed to parse file: ${e.message}`,
               severity: "error",
               ruleId: "parse-error"
           });
      }

      if (errors.length > 0) {
          results.push({
              file: relativePath,
              valid: false,
              errors
          });
      }
  }

  return results;
}

function checkStructure(root: string): ValidationResult | null {
    const errors: ValidationError[] = [];
    const requiredFiles = ["README.md"];

    // Check if it's an Antora component
    if (fs.existsSync(path.join(root, "antora.yml"))) {
        if (!fs.existsSync(path.join(root, "modules/ROOT/nav.adoc"))) {
            errors.push({
                message: "Antora component missing modules/ROOT/nav.adoc",
                severity: "error",
                ruleId: "structure-antora-nav"
            });
        }
    }

    // Check root required
    for (const req of requiredFiles) {
        if (!fs.existsSync(path.join(root, req))) {
             errors.push({
                message: `Missing required file: ${req}`,
                severity: "warning",
                ruleId: "structure-required"
            });
        }
    }

    if (errors.length > 0) {
        return {
            file: "Structure",
            valid: false,
            errors
        };
    }

    return null;
}
