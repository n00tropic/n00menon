import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { validateDocs } from "../lib/validate.js";
import { syncDocs } from "../lib/sync.js";
import path from "node:path";

// Define the tools
const TOOLS: Tool[] = [
  {
    name: "validate_docs",
    description: "Validate documentation files using Vale (prose) and Lychee (links).",
    inputSchema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: { type: "string" },
          description: "List of file paths or globs to validate. Defaults to docs/**/*.adoc",
        },
      },
      required: [],
    },
  },
  {
    name: "sync_docs",
    description: "Sync n00menon docs from docs/index.md to README.md and Antora pages.",
    inputSchema: {
      type: "object",
      properties: {
        check: {
          type: "boolean",
          description: "If true, only check for drift without writing changes.",
        },
      },
    },
  },
];

export async function startServer() {
  const server = new Server(
    {
      name: "n00menon-mcp-server",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "validate_docs") {
      const parsedCheck = z
        .object({
          files: z.array(z.string()).optional().default([]),
        })
        .safeParse(args);

      if (!parsedCheck.success) {
        throw new Error(`Invalid arguments: ${parsedCheck.error.message}`);
      }

      const results = await validateDocs(parsedCheck.data.files);
      const hasError = results.some((r) => !r.valid);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
        isError: hasError,
      };
    }

    if (name === "sync_docs") {
      const parsedArgs = z
        .object({
          check: z.boolean().optional().default(false),
        })
        .safeParse(args);

      if (!parsedArgs.success) {
        throw new Error(`Invalid args: ${parsedArgs.error}`);
      }

      const cwd = process.cwd();
      // Assuming standard layout if running in n00menon repo,
      // but we should probably make these configurable or detecting.
      // For now, hardcoding to n00menon structure relative to CWD.
      const paths = {
        source: path.join(cwd, "docs", "index.md"),
        readme: path.join(cwd, "README.md"),
        antora: path.join(cwd, "modules", "ROOT", "pages", "index.adoc"),
      };

      try {
        const results = syncDocs(paths, { check: parsedArgs.data.check });
        const drift = results.some((r) => !r.synced);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
          isError: drift,
        };
      } catch (e: any) {
        return {
          content: [{ type: "text", text: `Sync failed: ${e.message}` }],
          isError: true,
        };
      }
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("n00menon MCP Server running on stdio");
}
