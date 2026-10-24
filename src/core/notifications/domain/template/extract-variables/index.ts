const PLACEHOLDER_REGEX = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function extractVariables(template: string): string[] {
    return [...new Set([...template.matchAll(PLACEHOLDER_REGEX)].map((match) => match[1]!))];
}
