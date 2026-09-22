import { PaginationQueryDto } from "./";

describe("PaginationQueryDto", () => {
    it("should define default limit", () => {
        const dto = new PaginationQueryDto();
        expect(dto.limit).toBe(20);
    });

    it("should allow a cursor", () => {
        const dto = new PaginationQueryDto();
        dto.cursor = "cursor-123";
        expect(dto.cursor).toBe("cursor-123");
    });

    it("should allow a custom limit", () => {
        const dto = new PaginationQueryDto();
        dto.limit = 50;
        expect(dto.limit).toBe(50);
    });
});
