import { getAuditEventParamsSchema, listAuditEventsQuerySchema } from "./";

describe("listAuditEventsQuerySchema", () => {
    it("should accept valid optional fields", () => {
        const result = listAuditEventsQuerySchema.safeParse({
            userId: "550e8400-e29b-41d4-a716-446655440000",
            tenantId: "550e8400-e29b-41d4-a716-446655440001",
        });
        expect(result.success).toBe(true);
    });

    it("should accept an empty object since all fields are optional", () => {
        const result = listAuditEventsQuerySchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it("should reject when userId is not a valid UUID", () => {
        const result = listAuditEventsQuerySchema.safeParse({ userId: "invalid-uuid" });
        expect(result.success).toBe(false);
    });

    it("should reject when tenantId is not a valid UUID", () => {
        const result = listAuditEventsQuerySchema.safeParse({ tenantId: "invalid-uuid" });
        expect(result.success).toBe(false);
    });

    it("should reject when action is invalid", () => {
        const result = listAuditEventsQuerySchema.safeParse({ action: "INVALID_ACTION" });
        expect(result.success).toBe(false);
    });

    it("should reject when resource is invalid", () => {
        const result = listAuditEventsQuerySchema.safeParse({ resource: "INVALID_RESOURCE" });
        expect(result.success).toBe(false);
    });
});

describe("getAuditEventParamsSchema", () => {
    it("should accept a valid UUID", () => {
        const result = getAuditEventParamsSchema.safeParse({
            id: "550e8400-e29b-41d4-a716-446655440000",
        });
        expect(result.success).toBe(true);
    });

    it("should reject when id is not provided", () => {
        const result = getAuditEventParamsSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    it("should reject when id is not a valid UUID", () => {
        const result = getAuditEventParamsSchema.safeParse({ id: "invalid-id" });
        expect(result.success).toBe(false);
    });
});
