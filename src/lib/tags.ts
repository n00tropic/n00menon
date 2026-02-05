import matter from "gray-matter";

// Simple keyword-based tagger for now.
// Can be enhanced with LLM/NLP later.
const TAG_RULES: Record<string, string[]> = {
    "guide": ["how-to", "tutorial", "guide", "setup", "install"],
    "reference": ["api", "reference", "spec", "schema"],
    "concept": ["overview", "concept", "architecture", "explained"],
    "policy": ["policy", "rule", "standard", "compliance"],
    "security": ["security", "auth", "token", "permission", "rbac"],
    "platform": ["platform", "infrastructure", "docker", "k8s", "cloud"],
    "ai": ["ai", "agent", "llm", "model", "prompt", "mcp"]
};

export async function fixTags(content: string, filepath: string): Promise<string> {
    // Only support Markdown with YAML frontmatter for automatic tagging currently
    if (!filepath.endsWith(".md")) {
        return content;
    }

    const { data, content: body } = matter(content);

    const existingTags = new Set<string>(Array.isArray(data.tags) ? data.tags : []);
    const textToScan = (body + " " + (data.title || "") + " " + filepath).toLowerCase();

    for (const [tag, keywords] of Object.entries(TAG_RULES)) {
        if (keywords.some(k => textToScan.includes(k))) {
            existingTags.add(tag);
        }
    }

    data.tags = Array.from(existingTags);

    return matter.stringify(body, data);
}
