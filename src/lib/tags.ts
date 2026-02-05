import matter from "gray-matter";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

interface TagNode {
    description?: string;
    aliases?: string[];
    [key: string]: any;
}

interface TagRegistry {
    hierarchy: Record<string, TagNode>;
    [key: string]: any;
}

// Cache the loaded registry
let cachedTags: Set<string> | null = null;
let cachedAliases: Map<string, string[]> | null = null;

function findTagRegistry(root: string): string | null {
    // Search priorities:
    // 1. Environment variable
    // 2. Relative to n00menon (in platform/n00-cortex)
    // 3. Recursive up search

    if (process.env.TAG_REGISTRY_PATH && fs.existsSync(process.env.TAG_REGISTRY_PATH)) {
        return process.env.TAG_REGISTRY_PATH;
    }

    // Try standard platform path
    // root is usually where n00menon CLI is run from.
    // If run from platform/n00menon, n00-cortex is at ../n00-cortex
    const platformCortex = path.resolve(root, "../n00-cortex/data/catalog/project-tags.yaml");
    if (fs.existsSync(platformCortex)) return platformCortex;

    return null;
}

function parseHierarchy(node: any, prefix: string = "", tags: Set<string>, aliases: Map<string, string[]>) {
    for (const key of Object.keys(node)) {
        if (["description", "aliases"].includes(key)) continue;

        const currentTag = key; // Use leaf name as main tag, could be namespaced if needed
        tags.add(currentTag);

        // Add namespaced version if deep
        if (prefix) {
            tags.add(`${prefix}/${key}`);
        }

        const value = node[key];
        if (typeof value === "object") {
             // Collect aliases for this node
            const nodeAliases = value.aliases || [];

            // Also use description keywords if we wanted to be smarter, but for now aliases + key
            const keywords = [key, ...nodeAliases];
            aliases.set(currentTag, keywords);

            // Recurse
            parseHierarchy(value, prefix ? `${prefix}/${key}` : key, tags, aliases);
        }
    }
}

export function loadTagRegistry(root: string) {
    if (cachedTags && cachedAliases) return { tags: cachedTags, aliases: cachedAliases };

    const registryPath = findTagRegistry(root);
    const tags = new Set<string>();
    const aliases = new Map<string, string[]>();

    if (!registryPath) {
        console.warn("Project tag registry not found. Falling back to empty.");
        // Fallback or throw? For now warns.
        return { tags, aliases };
    }

    try {
        const doc = yaml.load(fs.readFileSync(registryPath, "utf8")) as TagRegistry;
        if (doc && doc.hierarchy) {
            parseHierarchy(doc.hierarchy, "", tags, aliases);
        }
    } catch (e) {
        console.error("Failed to parse tag registry:", e);
    }

    cachedTags = tags;
    cachedAliases = aliases;
    return { tags, aliases };
}

export function validateTags(tags: string[], root: string): string[] {
    const { tags: validTags } = loadTagRegistry(root);
    if (validTags.size === 0) return []; // Skip validation if registry missing

    const invalid: string[] = [];
    for (const tag of tags) {
        if (!validTags.has(tag)) {
            invalid.push(tag);
        }
    }
    return invalid;
}

export async function fixTags(content: string, filepath: string): Promise<string> {
    if (!filepath.endsWith(".md")) {
        return content;
    }

    const { data, content: body } = matter(content);
    // Determine root based on filepath or cwd
    const { aliases } = loadTagRegistry(process.cwd());

    if (aliases.size === 0) return content; // No registry, no fix

    const existingTags = new Set<string>(Array.isArray(data.tags) ? data.tags : []);
    const textToScan = (body + " " + (data.title || "") + " " + filepath).toLowerCase();

    for (const [tag, keywords] of aliases.entries()) {
        // Simple keyword match
        if (keywords.some(k => textToScan.includes(k.toLowerCase()))) {
            existingTags.add(tag);
        }
    }

    data.tags = Array.from(existingTags);

    return matter.stringify(body, data);
}
