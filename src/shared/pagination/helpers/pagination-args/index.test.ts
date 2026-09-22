import { withPaginationArgs } from "./";

describe("withPaginationArgs", () => {
    it("should return take with limit plus one when cursor is not provided", () => {
        const result = withPaginationArgs({ limit: 10 });
        expect(result).toEqual({ take: 11 });
    });

    it("should include cursor and skip when cursor is provided", () => {
        const result = withPaginationArgs({ cursor: "cursor-123", limit: 10 });
        expect(result).toEqual({ take: 11, skip: 1, cursor: { id: "cursor-123" } });
    });

    it("should not include cursor or skip when cursor is an empty string", () => {
        const result = withPaginationArgs({ cursor: "", limit: 10 });
        expect(result).toEqual({ take: 11 });
    });

    it("should calculate take correctly for different limits", () => {
        const result = withPaginationArgs({ limit: 0 });
        expect(result).toEqual({ take: 1 });
    });
});
