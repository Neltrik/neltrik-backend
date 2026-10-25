import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "br",
    "hr",
    "strong",
    "em",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "div",
    "span",
    "html",
    "body",
    "head",
    "title",
];

const ALLOWED_ATTRIBUTES = {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    html: ["lang"],
};

const ALLOWED_SCHEMES = ["http", "https", "mailto"];

function extractTags(html: string): string[] {
    const matches = html.matchAll(/<\/?([a-z][a-z0-9]*)/gi);
    return [...new Set([...matches].map((m) => m[1]!.toLowerCase()))];
}

function extractAttributes(html: string): string[] {
    const matches = html.matchAll(/\s([a-z][a-z0-9-]*)=/gi);
    return [...new Set([...matches].map((m) => m[1]!.toLowerCase()))];
}

function extractHrefs(html: string): string[] {
    const matches = html.matchAll(/href="([^"]*)"/gi);
    return [...matches].map((m) => m[1]!);
}

function extractSrcs(html: string): string[] {
    const matches = html.matchAll(/src="([^"]*)"/gi);
    return [...matches].map((m) => m[1]!);
}

export function validateHtml(html: string): string[] {
    const sanitized = sanitizeHtml(html, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: ALLOWED_ATTRIBUTES,
        allowedSchemes: ALLOWED_SCHEMES,
        allowedSchemesByTag: { img: ["http", "https"] },
        disallowedTagsMode: "discard",
    });
    const originalTags = extractTags(html);
    const sanitizedTags = extractTags(sanitized);
    const invalidTags = originalTags.filter((tag) => !sanitizedTags.includes(tag) && !ALLOWED_TAGS.includes(tag));
    const originalAttrs = extractAttributes(html);
    const sanitizedAttrs = extractAttributes(sanitized);
    const invalidAttrs = originalAttrs.filter((attr) => !sanitizedAttrs.includes(attr));
    const originalHrefs = extractHrefs(html);
    const sanitizedHrefs = extractHrefs(sanitized);
    const invalidHrefs = originalHrefs.filter((href) => !sanitizedHrefs.includes(href));
    const originalSrcs = extractSrcs(html);
    const sanitizedSrcs = extractSrcs(sanitized);
    const invalidSrcs = originalSrcs.filter((src) => !sanitizedSrcs.includes(src));
    const errors: string[] = [];
    if (invalidTags.length > 0) {
        errors.push(`Disallowed tags: ${invalidTags.join(", ")}`);
    }
    if (invalidAttrs.length > 0) {
        errors.push(`Disallowed attributes: ${invalidAttrs.join(", ")}`);
    }
    if (invalidHrefs.length > 0) {
        errors.push(`Disallowed links: ${invalidHrefs.join(", ")}`);
    }
    if (invalidSrcs.length > 0) {
        errors.push(`Disallowed sources: ${invalidSrcs.join(", ")}`);
    }
    return errors;
}
