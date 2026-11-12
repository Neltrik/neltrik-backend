import { companyIdParamsSchema, createCompanySchema, listCompaniesQuerySchema, updateCompanySchema } from "./";

const validId = "550e8400-e29b-41d4-a716-446655440000";

describe("createCompanySchema", () => {
    it("should validate a correct company", () => {
        expect(createCompanySchema.safeParse({ name: "Acme Corporation", slug: "acme-corporation" }).success).toBe(
            true,
        );
    });

    it("should accept minimum and maximum valid lengths", () => {
        expect(createCompanySchema.safeParse({ name: "A", slug: "abc" }).success).toBe(true);
        expect(createCompanySchema.safeParse({ name: "A".repeat(255), slug: "a".repeat(50) }).success).toBe(true);
    });

    it.each(["", "A".repeat(256)])("should reject an invalid name length", (name) => {
        expect(createCompanySchema.safeParse({ name, slug: "valid-slug" }).success).toBe(false);
    });

    it("should reject a missing name", () => {
        expect(createCompanySchema.safeParse({ slug: "valid-slug" }).success).toBe(false);
    });

    it("should reject a missing slug", () => {
        expect(createCompanySchema.safeParse({ name: "Acme" }).success).toBe(false);
    });

    it.each(["", "ab", "Acm", "Acme", "acme-", "-acme", "acme--corp", "acme_corp", "acme corp", "a".repeat(51)])(
        "should reject an invalid slug: %s",
        (slug) => {
            expect(createCompanySchema.safeParse({ name: "Acme", slug }).success).toBe(false);
        },
    );

    it("should reject non-string values", () => {
        expect(createCompanySchema.safeParse({ name: 123, slug: "valid-slug" }).success).toBe(false);
        expect(createCompanySchema.safeParse({ name: "Acme", slug: 123 }).success).toBe(false);
    });
});

describe("companyIdParamsSchema", () => {
    it("should validate a correct id", () => {
        expect(companyIdParamsSchema.safeParse({ id: validId }).success).toBe(true);
    });

    it.each(["invalid", "", "123", "550e8400-e29b-41d4-a716"])("should reject an invalid id: %s", (id) => {
        expect(companyIdParamsSchema.safeParse({ id }).success).toBe(false);
    });

    it("should reject a missing id", () => {
        expect(companyIdParamsSchema.safeParse({}).success).toBe(false);
    });

    it("should reject a non-string id", () => {
        expect(companyIdParamsSchema.safeParse({ id: 123 }).success).toBe(false);
    });
});

describe("listCompaniesQuerySchema", () => {
    it("should accept an empty query and coerce limit to a number", () => {
        expect(listCompaniesQuerySchema.safeParse({}).success).toBe(true);
        expect(listCompaniesQuerySchema.safeParse({ limit: "10" }).success).toBe(true);
    });

    it.each([0, -1, 101, 1.5, "invalid"])("should reject limit %s", (limit) => {
        expect(listCompaniesQuerySchema.safeParse({ limit }).success).toBe(false);
    });
});

describe("updateCompanySchema", () => {
    it("should validate a correct company update", () => {
        expect(updateCompanySchema.safeParse({ name: "Updated Company", slug: "updated-company" }).success).toBe(true);
    });

    it("should accept an empty object", () => {
        expect(updateCompanySchema.safeParse({}).success).toBe(true);
    });

    it("should accept updating only the name", () => {
        expect(updateCompanySchema.safeParse({ name: "Updated Company" }).success).toBe(true);
    });

    it("should accept updating only the slug", () => {
        expect(updateCompanySchema.safeParse({ slug: "updated-company" }).success).toBe(true);
    });

    it.each(["", "A".repeat(256)])("should reject an invalid name length: %s", (name) => {
        expect(updateCompanySchema.safeParse({ name }).success).toBe(false);
    });

    it.each(["", "ab", "Acm", "Acme", "acme-", "-acme", "acme--corp", "acme_corp", "a".repeat(51)])(
        "should reject an invalid slug: %s",
        (slug) => {
            expect(updateCompanySchema.safeParse({ slug }).success).toBe(false);
        },
    );

    it("should reject non-string values", () => {
        expect(updateCompanySchema.safeParse({ name: 123 }).success).toBe(false);
        expect(updateCompanySchema.safeParse({ slug: 123 }).success).toBe(false);
    });
});
