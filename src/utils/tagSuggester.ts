/**
 * Rule-based tag suggestion utility.
 * Scans content for frontend and AI-related keywords to suggest relevant tags.
 */

interface TagKeywordRule {
  tag: string;
  pattern: RegExp;
}

const TAG_RULES: TagKeywordRule[] = [
  { tag: '#react', pattern: /\breact(?:js)?\b/i },
  { tag: '#tailwind', pattern: /\btailwind(?:css)?\b/i },
  { tag: '#typescript', pattern: /\btypescript\b|\bts\b/i },
  { tag: '#javascript', pattern: /\bjavascript\b|\bjs\b|\becmascript\b/i },
  { tag: '#vite', pattern: /\bvite\b/i },
  { tag: '#css', pattern: /\bcss(?:3)?\b/i },
  { tag: '#html', pattern: /\bhtml(?:5)?\b/i },
  { tag: '#node', pattern: /\bnode(?:js)?\b/i },
  { tag: '#express', pattern: /\bexpress(?:js)?\b/i },
  { tag: '#git', pattern: /\bgit\b/i },
  { tag: '#github', pattern: /\bgithub\b/i },
  { tag: '#netlify', pattern: /\bnetlify\b/i },
  { tag: '#api', pattern: /\bapis?\b|\brest(?:ful)?\b/i },
  { tag: '#hook', pattern: /\bhooks?\b/i },
  { tag: '#context', pattern: /\bcontext\b/i },
  { tag: '#component', pattern: /\bcomponents?\b|\bbileşen(?:ler)?\b/i },
  { tag: '#flexbox', pattern: /\bflexbox\b/i },
  { tag: '#grid', pattern: /\bgrid\b/i },
  { tag: '#storage', pattern: /\bstorage\b|\blocalstorage\b|\bsessionstorage\b/i },
  { tag: '#mcp', pattern: /\bmcp\b/i },
  { tag: '#prompt', pattern: /\bprompts?\b|\bprompting\b|\bistem(?:ler)?\b/i },
  { tag: '#llm', pattern: /\bllms?\b/i },
];

/**
 * Scans the provided text for frontend and AI keywords and returns
 * suggested tags that are not already present in existingTags.
 *
 * @param text The text to scan (title, notes, or combined content)
 * @param existingTags Current list of tags already attached to the entry
 * @returns Array of suggested tags (prefixed with '#')
 */
export function suggestTags(text: string, existingTags: string[]): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const existingLookup: Record<string, true> = {};
  if (Array.isArray(existingTags)) {
    for (const tag of existingTags) {
      if (typeof tag === 'string') {
        const clean = tag.replace(/^#+/, '').trim().toLowerCase();
        if (clean.length > 0) {
          existingLookup[`#${clean}`] = true;
        }
      }
    }
  }

  const suggestions: string[] = [];
  for (const rule of TAG_RULES) {
    if (existingLookup[rule.tag]) {
      continue;
    }
    if (rule.pattern.test(text)) {
      suggestions.push(rule.tag);
    }
  }

  return suggestions;
}
