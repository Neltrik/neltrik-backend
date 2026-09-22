import { paginate } from "./";

describe("paginate", () => {
    it("should return all items when there are no more items than the limit", () => {
        const items = [{ id: "1" }, { id: "2" }];
        const result = paginate({ items, limit: 2, getId: (item) => item.id });
        expect(result).toEqual({ items, meta: { nextCursor: null, hasMore: false } });
    });

    it("should return a paginated list when there are more items than the limit", () => {
        const items = [{ id: "1" }, { id: "2" }, { id: "3" }];
        const result = paginate({ items, limit: 2, getId: (item) => item.id });
        expect(result).toEqual({ items: [{ id: "1" }, { id: "2" }], meta: { nextCursor: "2", hasMore: true } });
    });

    it("should use getId from the last item as the next cursor", () => {
        const items = [{ id: "first" }, { id: "second" }, { id: "third" }];
        const result = paginate({ items, limit: 2, getId: (item) => item.id });
        expect(result.meta.nextCursor).toBe("second");
    });

    it("should return an empty list when items is empty", () => {
        const items: { id: number }[] = [];
        const result = paginate({ items, limit: 10, getId: () => "1" });
        expect(result).toEqual({ items: [], meta: { nextCursor: null, hasMore: false } });
    });

    it("should return all items when the limit is greater than the number of items", () => {
        const items = [{ id: "1" }, { id: "2" }];
        const result = paginate({ items, limit: 5, getId: (item) => item.id });
        expect(result).toEqual({ items, meta: { nextCursor: null, hasMore: false } });
    });
});
