import { paginationQuerySchema } from ".";

describe("paginationQuerySchema", () => {
    it("should return default limit when limit is not provided", () => {
        const result = paginationQuerySchema.parse({});
        expect(result).toEqual({ limit: 20 });
    });

    it("should accept a valid cursor", () => {
        const result = paginationQuerySchema.parse({ cursor: "cursor-123", limit: 10 });
        expect(result).toEqual({ cursor: "cursor-123", limit: 10 });
    });

    it("should coerce limit from string to number", () => {
        const result = paginationQuerySchema.parse({ limit: "10" });
        expect(result).toEqual({ limit: 10 });
    });

    it("should accept the minimum limit", () => {
        const result = paginationQuerySchema.parse({ limit: 1 });
        expect(result).toEqual({ limit: 1 });
    });

    it("should accept the maximum limit", () => {
        const result = paginationQuerySchema.parse({ limit: 100 });
        expect(result).toEqual({ limit: 100 });
    });

    it("should reject a limit below 1", () => {
        expect(() => paginationQuerySchema.parse({ limit: 0 })).toThrow();
    });

    it("should reject a limit above 100", () => {
        expect(() => paginationQuerySchema.parse({ limit: 101 })).toThrow();
    });

    it("should reject a non-integer limit", () => {
        expect(() => paginationQuerySchema.parse({ limit: 10.5 })).toThrow();
    });

    it("should reject an invalid limit", () => {
        expect(() => paginationQuerySchema.parse({ limit: "invalid" })).toThrow();
    });

    it("should reject a non-string cursor", () => {
        expect(() => paginationQuerySchema.parse({ cursor: 123 })).toThrow();
    });
});
