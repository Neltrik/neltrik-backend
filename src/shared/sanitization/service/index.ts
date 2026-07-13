import sanitizeHtml from "sanitize-html";

export type Sanitizable =
    string | number | boolean | null | undefined | Date | Sanitizable[] | { [key: string]: Sanitizable };

export class SanitizationService {
    public sanitize(value: Sanitizable): Sanitizable {
        if (value === null || value === undefined) {
            return value;
        }
        if (value instanceof Date) {
            return value;
        }
        if (typeof value === "string") {
            return sanitizeHtml(value, {
                allowedTags: [],
                allowedAttributes: {},
                disallowedTagsMode: "discard",
            })
                .replace(/\s+/g, " ")
                .trim();
        }
        if (Array.isArray(value)) {
            return value.map((item) => this.sanitize(item));
        }
        if (typeof value === "object") {
            const entries = Object.entries(value);
            return Object.fromEntries(entries.map(([key, value]) => [key, this.sanitize(value)]));
        }
        return value;
    }
}
