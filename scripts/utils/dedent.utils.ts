export function dedent(value: string): string {
    const lines = value.replace(/^\n/, "").split("\n");
    const indent = Math.min(...lines.filter((line) => line.trim()).map((line) => line.match(/^ */)?.[0].length ?? 0));
    return lines.map((line) => line.slice(indent)).join("\n");
}
