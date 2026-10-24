import { extractVariables } from "./";

describe("extractVariables", () => {
    it("returns an empty array when there are no variables", () => {
        expect(extractVariables("Hello world")).toEqual([]);
    });

    it("extracts a single variable", () => {
        expect(extractVariables("Hello {{name}}")).toEqual(["name"]);
    });

    it("extracts multiple variables", () => {
        expect(extractVariables("Hello {{name}}, click {{url}}")).toEqual(["name", "url"]);
    });

    it("deduplicates variables", () => {
        expect(extractVariables("Hello {{name}}, {{name}} again")).toEqual(["name"]);
    });

    it("handles whitespace inside placeholders", () => {
        expect(extractVariables("Hello {{ name }}")).toEqual(["name"]);
    });

    it("ignores invalid placeholders", () => {
        expect(extractVariables("Hello {{na-me}}")).toEqual([]);
    });
});
