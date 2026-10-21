import { StringInterpolationRenderer } from ".";

describe("StringInterpolationRenderer", () => {
    let renderer: StringInterpolationRenderer;

    beforeEach(() => {
        renderer = new StringInterpolationRenderer();
    });

    it("replaces a single variable", () => {
        const result = renderer.render("Hello {{name}}", { name: "Juan" });
        expect(result).toBe("Hello Juan");
    });

    it("replaces multiple variables", () => {
        const result = renderer.render("Hello {{name}}, click {{url}}", {
            name: "Juan",
            url: "https://neltrik.com",
        });
        expect(result).toBe("Hello Juan, click https://neltrik.com");
    });

    it("handles whitespace inside placeholders", () => {
        const result = renderer.render("Hello {{ name }}", { name: "Juan" });
        expect(result).toBe("Hello Juan");
    });

    it("leaves literal placeholder when variable is missing", () => {
        const result = renderer.render("Hello {{name}}", {});
        expect(result).toBe("Hello {{name}}");
    });

    it("leaves literal placeholder when variable is null", () => {
        const result = renderer.render("Hello {{name}}", { name: null });
        expect(result).toBe("Hello {{name}}");
    });

    it("converts numbers to string", () => {
        const result = renderer.render("Count: {{count}}", { count: 42 });
        expect(result).toBe("Count: 42");
    });

    it("converts booleans to string", () => {
        const result = renderer.render("Active: {{active}}", { active: true });
        expect(result).toBe("Active: true");
    });

    it("does not match invalid placeholder syntax", () => {
        const result = renderer.render("Hello {{na-me}}", { "na-me": "Juan" });
        expect(result).toBe("Hello {{na-me}}");
    });

    it("returns template unchanged when there are no placeholders", () => {
        const result = renderer.render("Hello world", { name: "Juan" });
        expect(result).toBe("Hello world");
    });

    it("handles empty payload", () => {
        const result = renderer.render("Hello {{name}}", {});
        expect(result).toBe("Hello {{name}}");
    });

    it("leaves literal placeholder when value is an object", () => {
        const result = renderer.render("Hello {{user}}", { user: { name: "Juan" } });
        expect(result).toBe("Hello {{user}}");
    });

    it("leaves literal placeholder when value is an array", () => {
        const result = renderer.render("Items: {{items}}", { items: [1, 2, 3] });
        expect(result).toBe("Items: {{items}}");
    });
});
