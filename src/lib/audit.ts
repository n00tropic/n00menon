import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { globby } from "globby";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { ValidationResult, ValidationError } from "./types.js";
import { validateTags } from "./tags.js";

// Init AJV
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

let schemaValidator: any = null;

function loadSchema(root: string) {
    if (schemaValidator) return schemaValidator;

    // Use environment variable or look for sibling directory
    const schemaPath = process.env.SCHEMA_PATH || path.resolve(root, "../../platform/n00-cortex/schemas/document-metadata.schema.json");

    // Fallback: Check if we are inside n00menon in the monorepo context
    const possiblePaths = [
        schemaPath,
        path.resolve(root, "../n00-cortex/schemas/document-metadata.schema.json"), // sibling in platform/
        path.resolve(process.cwd(), "../n00-cortex/schemas/document-metadata.schema.json")
    ];

    let finalPath = "";
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            finalPath = p;
            break;
        }
    }

    if (!finalPath) {
        throw new Error(`Could not find document-metadata.schema.json. Searched locations: ${possiblePaths.join(", ")}`);
    }

    try {
        const schema = JSON.parse(fs.readFileSync(finalPath, "utf8"));
        schemaValidator = ajv.compile(schema);
        return schemaValidator;
    } catch (e: any) {
        throw new Error(`Failed to load or compile schema from ${finalPath}: ${e.message}`);
    }
}

export async function auditDocs(
  root: string,
  // options: { fix?: boolean } = {} // Unused for now
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  // 1. Structural Checks
  const structuralResult = checkStructure(root);
  if (structuralResult) results.push(structuralResult);

  // Load Schema
  let validator: any;
  try {
      validator = loadSchema(root);
  } catch (e: any) {
      // If we can't load the schema, we can't validate metadata. return error result.
      results.push({
          file: "Configuration",
          valid: false,
          errors: [{
              message: e.message,
              severity: "error",
              ruleId: "schema-load"
          }]
      });
      return results;
  }

  // 2. Content Checks (Frontmatter)
  const files = await globby(["**/*.md", "**/*.adoc"], {
      cwd: root,
      ignore: ["**/node_modules/**", "**/dist/**", "**/.*", "**/README.md"],
      absolute: true
  });

  for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      const relativePath = path.relative(root, file);
      const errors: ValidationError[] = [];

      try {
          if (file.endsWith(".md")) {
              const { data } = matter(content);

              const valid = validator(data);

              if (!valid) {
                  validator.errors?.forEach((e: any) => {
                      errors.push({
                          message: `Frontmatter: ${e.instancePath} ${e.message}`,
                          severity: "error",
                          ruleId: "frontmatter-schema"
                      });
                  });
              }

              // Tag Validation
              if (Array.isArray(data.tags)) {
                  const invalidTags = validateTags(data.tags, root);
                  if (invalidTags.length > 0) {
                      errors.push({
                          message: `Invalid Tags: ${invalidTags.join(", ")}. Allowed tags are defined in project-tags.yaml`,
                          severity: "error",
                          ruleId: "tag-taxonomy"
                      });
                  }
              }
          }
           // AsciiDoc support TBD

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
