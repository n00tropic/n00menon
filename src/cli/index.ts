#!/usr/bin/env node
import { Command } from "commander";
import { startServer } from "../mcp/server.js";
import { validateDocs } from "../lib/validate.js";
import { syncDocs } from "../lib/sync.js";
import { auditDocs } from "../lib/audit.js";
import { fixTags } from "../lib/tags.js";
import chalk from "chalk";
import path from "node:path";
import process from "node:process";
import fs from "node:fs";

const program = new Command();

program
  .name("n00menon")
  .description("Document Curation Hub CLI")
  .version("0.1.0");

program
  .command("serve")
  .description("Start the MCP server on stdio")
  .action(async () => {
    await startServer();
  });

program
  .command("check")
  .description("Validate documentation files")
  .argument("[files...]", "Files or globs to validate")
  .option("--skip-vale", "Skip Vale checks")
  .option("--skip-lychee", "Skip Lychee link checks")
  .action(async (files, options) => {
    console.log(chalk.blue("Running n00menon validation..."));
    const results = await validateDocs(files, options);

    let hasError = false;
    for (const result of results) {
        if (!result.valid) {
            hasError = true;
            console.log(chalk.red(`\n✖ ${result.file}`));
            for (const error of result.errors) {
                const loc = error.line ? `${error.line}:${error.column || 0}` : "";
                console.log(`  ${chalk.gray(loc)} ${chalk.yellow(error.severity)} ${error.message} ${chalk.gray(`(${error.ruleId})`)}`);
            }
        }
    }

    if (hasError) {
        console.log(chalk.red("\nValidation failed."));
        process.exit(1);
    } else {
        console.log(chalk.green("\nAll checks passed."));
    }
  });

program
  .command("sync")
  .description("Sync n00menon documentation")
  .option("--check", "Check for drift without writing")
  .action(async (options) => {
      const cwd = process.cwd();
      const paths = {
          source: path.join(cwd, "docs", "index.md"),
          readme: path.join(cwd, "README.md"),
          antora: path.join(cwd, "modules", "ROOT", "pages", "index.adoc")
      };

      console.log(chalk.blue(`Syncing docs... (${options.check ? "Check Mode" : "Write Mode"})`));

      try {
        const results = syncDocs(paths, { check: options.check });
        const drift = results.filter(r => !r.synced);

        if (drift.length > 0) {
            console.log(chalk.red("\nDrift detected:"));
            drift.forEach(d => console.log(`  - ${path.relative(cwd, d.target)}`));

            if (options.check) {
                console.log(chalk.red("\nRun 'n00menon sync' to fix."));
                process.exit(1);
            } else {
                console.log(chalk.green("\nUpdated files."));
            }
        } else {
            console.log(chalk.green("Docs are in sync."));
        }

      } catch (e: any) {
          console.error(chalk.red(`Sync error: ${e.message}`));
          process.exit(1);
      }
  });

program
  .command("audit")
  .description("Audit documentation for structural checks and frontmatter validity")
  .argument("[root]", "Root directory to audit")
  .action(async (root) => {
      const targetRoot = root || process.cwd();
      console.log(chalk.blue(`Auditing ${targetRoot}...`));

      const results = await auditDocs(targetRoot);
      let errors = 0;

      results.forEach(res => {
          if (!res.valid) {
              console.log(chalk.red(`\n✖ ${res.file}`));
              res.errors.forEach(e => {
                  console.log(`  ${chalk.yellow(e.severity)}: ${e.message}`);
              });
              errors++;
          }
      });

      if (errors > 0) {
          console.log(chalk.red(`\nFound issues in ${errors} files.`));
          process.exit(1);
      } else {
          console.log(chalk.green("\nAudit passed."));
      }
  });

program
    .command("fix-tags")
    .description("Auto-generate tags for documentation files")
    .argument("[files...]", "Files or globs to process")
    .action(async (fileArgs) => {
        const { globby } = await import("globby");
        const files = await globby(fileArgs.length ? fileArgs : ["docs/**/*.md"], { gitignore: true });

        console.log(chalk.blue(`Processing tags for ${files.length} files...`));

        for (const file of files) {
             try {
                 const content = fs.readFileSync(file, "utf8");
                 const updated = await fixTags(content, file);
                 if (content !== updated) {
                     fs.writeFileSync(file, updated);
                     console.log(chalk.green(`Updated: ${file}`));
                 }
             } catch (e: any) {
                 console.warn(chalk.yellow(`Skipped ${file}: ${e.message}`));
             }
        }
        console.log(chalk.blue("Done."));
    });

program
    .command("fix-style")
    .description("Fix style issues (Not yet implemented)")
    .option("--pattern <pattern>", "Pattern to fix")
    .action(() => {
        console.log("Fix style not yet implemented in n00menon CLI");
    });

program.parse();
