import { createVacancySchema } from "./";

describe("createVacancySchema", () => {
    const validPayload = {
        title: "Backend Developer",
        description: "Develop backend services.",
        companyId: "550e8400-e29b-41d4-a716-446655440000",
        recruiterId: "550e8400-e29b-41d4-a716-446655440001",
        employmentType: "FULL_TIME",
        workMode: "REMOTE",
        closingDate: "2026-12-31T00:00:00.000Z",
        salary: 5000,
        location: "Colombia",
    };

    it("should validate a correct payload", () => {
        const result = createVacancySchema.safeParse(validPayload);
        expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
        const result = createVacancySchema.safeParse({ ...validPayload, title: "" });
        expect(result.success).toBe(false);
    });

    it("should reject empty description", () => {
        const result = createVacancySchema.safeParse({
            ...validPayload,
            description: "",
        });
        expect(result.success).toBe(false);
    });

    it("should reject invalid company id", () => {
        const result = createVacancySchema.safeParse({ ...validPayload, companyId: "invalid-id" });
        expect(result.success).toBe(false);
    });

    it("should reject negative salary", () => {
        const result = createVacancySchema.safeParse({ ...validPayload, salary: -1 });
        expect(result.success).toBe(false);
    });

    it("should allow nullable salary", () => {
        const result = createVacancySchema.safeParse({ ...validPayload, salary: null });
        expect(result.success).toBe(true);
    });

    it("should allow nullable location", () => {
        const result = createVacancySchema.safeParse({ ...validPayload, location: null });
        expect(result.success).toBe(true);
    });
});
