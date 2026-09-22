export function extractPayload(value: unknown): { data: unknown; meta: Record<string, unknown> } {
    if (
        typeof value === "object" &&
        value !== null &&
        "data" in value &&
        "meta" in value &&
        typeof (value as { meta: unknown }).meta === "object"
    ) {
        return value as { data: unknown; meta: Record<string, unknown> };
    }
    return { data: value, meta: {} };
}
