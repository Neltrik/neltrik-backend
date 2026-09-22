import type { PaginateOutput, PaginateParams } from "../../types";

export function paginate<T>({ items, limit, getId }: PaginateParams<T>): PaginateOutput<T> {
    const hasMore = items.length > limit;
    const pageItems = hasMore ? items.slice(0, limit) : items;
    const lastItem = pageItems[pageItems.length - 1];
    const nextCursor = hasMore && lastItem ? getId(lastItem) : null;
    return { items: pageItems, meta: { nextCursor, hasMore } };
}
