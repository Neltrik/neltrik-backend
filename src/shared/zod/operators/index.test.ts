import { z } from "zod";

import { xor } from "./";

describe("xor", () => {
    it("should pass when exactly one field is provided", () => {
        const schema = xor(z.object({ foo: z.string().optional(), bar: z.string().optional() }));
        expect(schema.safeParse({ foo: "value" }).success).toBe(true);
        expect(schema.safeParse({ bar: "value" }).success).toBe(true);
    });

    it("should fail when no field is provided", () => {
        const schema = xor(z.object({ foo: z.string().optional(), bar: z.string().optional() }));
        const result = schema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toHaveLength(1);
            expect(result.error.issues[0]).toEqual({
                code: "custom",
                message: "Exactly one of foo, bar must be provided",
                path: ["foo"],
            });
        }
    });

    it("should fail when more than one field is provided", () => {
        const schema = xor(z.object({ foo: z.string().optional(), bar: z.string().optional() }));
        const result = schema.safeParse({ foo: "foo", bar: "bar" });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toHaveLength(1);
            expect(result.error.issues[0]).toEqual({
                code: "custom",
                message: "Only one of foo, bar can be provided, not both",
                path: ["foo"],
            });
        }
    });

    it("should fail when all fields are provided", () => {
        const schema = xor(
            z.object({ foo: z.string().optional(), bar: z.string().optional(), baz: z.string().optional() }),
        );
        const result = schema.safeParse({ foo: "foo", bar: "bar", baz: "baz" });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toHaveLength(1);
            expect(result.error.issues[0]).toEqual({
                code: "custom",
                message: "Only one of foo, bar, baz can be provided, not both",
                path: ["foo"],
            });
        }
    });

    it("should treat undefined as not provided", () => {
        const schema = xor(z.object({ foo: z.string().optional(), bar: z.string().optional() }));
        const result = schema.safeParse({ foo: undefined, bar: "value" });
        expect(result.success).toBe(true);
    });

    it("should treat null as not provided", () => {
        const schema = xor(z.object({ foo: z.string().nullable().optional(), bar: z.string().optional() }));
        const result = schema.safeParse({ foo: null, bar: "value" });
        expect(result.success).toBe(true);
    });

    it("should treat an empty string as not provided", () => {
        const schema = xor(z.object({ foo: z.string().optional(), bar: z.string().optional() }));
        const result = schema.safeParse({ foo: "", bar: "value" });
        expect(result.success).toBe(true);
    });

    it("should fail when all fields are empty", () => {
        const schema = xor(z.object({ foo: z.string().optional(), bar: z.string().optional() }));
        const result = schema.safeParse({ foo: "", bar: "" });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toHaveLength(1);
            expect(result.error.issues[0]).toEqual({
                code: "custom",
                message: "Exactly one of foo, bar must be provided",
                path: ["foo"],
            });
        }
    });

    it("should treat whitespace as a provided value", () => {
        const schema = xor(z.object({ foo: z.string().optional(), bar: z.string().optional() }));
        const result = schema.safeParse({ foo: " " });
        expect(result.success).toBe(true);
    });

    it("should not add issues when the schema has no keys", () => {
        const schema = xor(z.object({}));
        const result = schema.safeParse({});
        expect(result.success).toBe(true);
        if (!result.success) {
            expect(result.error.issues).toHaveLength(0);
        }
    });

    it("should validate the schema fields before applying xor validation", () => {
        const schema = xor(z.object({ foo: z.string().optional(), bar: z.string().optional() }));
        const result = schema.safeParse({ foo: 123 });
        expect(result.success).toBe(false);
    });
});
