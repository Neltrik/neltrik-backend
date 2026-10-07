import { FILE_PURPOSE, FILE_STATUS } from "../../../domain/types";
import {
    deleteFileParamsSchema,
    getDownloadUrlParamsSchema,
    getFileParamsSchema,
    listFilesQuerySchema,
    replaceFileParamsSchema,
    uploadFileBodySchema,
} from "./";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

describe("file params schemas", () => {
    const schemas = [
        ["getFileParamsSchema", getFileParamsSchema],
        ["getDownloadUrlParamsSchema", getDownloadUrlParamsSchema],
        ["deleteFileParamsSchema", deleteFileParamsSchema],
        ["replaceFileParamsSchema", replaceFileParamsSchema],
    ] as const;

    it.each(schemas)("should validate a correct payload for %s", (_, schema) => {
        const result = schema.safeParse({ fileId: validUuid });
        expect(result.success).toBe(true);
    });

    it.each(schemas)("should reject an invalid fileId for %s", (_, schema) => {
        const result = schema.safeParse({ fileId: "invalid-id" });
        expect(result.success).toBe(false);
    });

    it.each(schemas)("should reject a missing fileId for %s", (_, schema) => {
        const result = schema.safeParse({});
        expect(result.success).toBe(false);
    });

    it.each(schemas)("should reject a non-string fileId for %s", (_, schema) => {
        const result = schema.safeParse({ fileId: 123 });
        expect(result.success).toBe(false);
    });
});

describe("uploadFileBodySchema", () => {
    const validPayload = { purpose: FILE_PURPOSE.CV, resourceType: "user", resourceId: validUuid };

    it("should validate a correct payload", () => {
        const result = uploadFileBodySchema.safeParse(validPayload);
        expect(result.success).toBe(true);
    });

    it.each([FILE_PURPOSE.CV, FILE_PURPOSE.AVATAR, FILE_PURPOSE.DOCUMENT])("should validate purpose %s", (purpose) => {
        const result = uploadFileBodySchema.safeParse({ ...validPayload, purpose });
        expect(result.success).toBe(true);
    });

    it("should reject an invalid purpose", () => {
        const result = uploadFileBodySchema.safeParse({ ...validPayload, purpose: "invalid" });
        expect(result.success).toBe(false);
    });

    it("should reject an empty resourceType", () => {
        const result = uploadFileBodySchema.safeParse({ ...validPayload, resourceType: "" });
        expect(result.success).toBe(false);
    });

    it("should reject a resourceType longer than 50 characters", () => {
        const result = uploadFileBodySchema.safeParse({ ...validPayload, resourceType: "a".repeat(51) });
        expect(result.success).toBe(false);
    });

    it("should reject an invalid resourceId", () => {
        const result = uploadFileBodySchema.safeParse({ ...validPayload, resourceId: "invalid-id" });
        expect(result.success).toBe(false);
    });

    it("should reject missing required fields", () => {
        const result = uploadFileBodySchema.safeParse({});
        expect(result.success).toBe(false);
    });
});

describe("listFilesQuerySchema", () => {
    it("should validate an empty payload with the default limit", () => {
        const result = listFilesQuerySchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.limit).toBe(20);
        }
    });

    it("should validate a complete payload", () => {
        const result = listFilesQuerySchema.safeParse({
            cursor: validUuid,
            limit: 50,
            ownerId: validUuid,
            resourceType: "user",
            resourceId: validUuid,
            purpose: FILE_PURPOSE.CV,
            status: FILE_STATUS.READY,
        });
        expect(result.success).toBe(true);
    });

    it("should coerce limit from string to number", () => {
        const result = listFilesQuerySchema.safeParse({ limit: "50" });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.limit).toBe(50);
        }
    });

    it("should reject a limit below 1", () => {
        const result = listFilesQuerySchema.safeParse({ limit: 0 });
        expect(result.success).toBe(false);
    });

    it("should reject a limit above 100", () => {
        const result = listFilesQuerySchema.safeParse({ limit: 101 });
        expect(result.success).toBe(false);
    });

    it("should reject a decimal limit", () => {
        const result = listFilesQuerySchema.safeParse({ limit: 10.5 });
        expect(result.success).toBe(false);
    });

    it("should reject invalid UUID filters", () => {
        const result = listFilesQuerySchema.safeParse({ cursor: "invalid", ownerId: "invalid", resourceId: "invalid" });
        expect(result.success).toBe(false);
    });

    it("should reject an empty resourceType", () => {
        const result = listFilesQuerySchema.safeParse({ resourceType: "" });
        expect(result.success).toBe(false);
    });

    it("should reject a resourceType longer than 50 characters", () => {
        const result = listFilesQuerySchema.safeParse({ resourceType: "a".repeat(51) });
        expect(result.success).toBe(false);
    });

    it.each([FILE_PURPOSE.CV, FILE_PURPOSE.AVATAR, FILE_PURPOSE.DOCUMENT])("should validate purpose %s", (purpose) => {
        const result = listFilesQuerySchema.safeParse({ purpose });
        expect(result.success).toBe(true);
    });

    it("should reject an invalid purpose", () => {
        const result = listFilesQuerySchema.safeParse({ purpose: "invalid" });
        expect(result.success).toBe(false);
    });

    it.each([FILE_STATUS.PENDING, FILE_STATUS.READY, FILE_STATUS.INFECTED, FILE_STATUS.DELETED])(
        "should validate status %s",
        (status) => {
            const result = listFilesQuerySchema.safeParse({ status });
            expect(result.success).toBe(true);
        },
    );

    it("should reject an invalid status", () => {
        const result = listFilesQuerySchema.safeParse({ status: "invalid" });
        expect(result.success).toBe(false);
    });
});
