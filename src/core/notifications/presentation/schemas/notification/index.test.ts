import { listNotificationsQuerySchema, markNotificationAsReadParamsSchema } from "./";

const validId = "550e8400-e29b-41d4-a716-446655440000";

describe("markNotificationAsReadParamsSchema", () => {
    it("should validate a correct id", () => {
        expect(markNotificationAsReadParamsSchema.safeParse({ id: validId }).success).toBe(true);
    });

    it.each(["invalid", "", "123", "550e8400-e29b-41d4-a716"])("should reject an invalid id: %s", (id) => {
        expect(markNotificationAsReadParamsSchema.safeParse({ id }).success).toBe(false);
    });

    it("should reject a missing id", () => {
        expect(markNotificationAsReadParamsSchema.safeParse({}).success).toBe(false);
    });

    it("should reject a non-string id", () => {
        expect(markNotificationAsReadParamsSchema.safeParse({ id: 123 }).success).toBe(false);
    });
});

describe("listNotificationsQuerySchema", () => {
    it("should accept an empty query and coerce limit to a number", () => {
        expect(listNotificationsQuerySchema.safeParse({}).success).toBe(true);
        expect(listNotificationsQuerySchema.safeParse({ limit: "10" }).success).toBe(true);
    });

    it.each([0, -1, 101, 1.5, "invalid"])("should reject limit %s", (limit) => {
        expect(listNotificationsQuerySchema.safeParse({ limit }).success).toBe(false);
    });
});
