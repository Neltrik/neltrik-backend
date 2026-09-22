type PaginationResult = {
    nextCursor: string | null;
    hasMore: boolean;
};

export type PaginationInput = {
    cursor?: string;
    limit: number;
};

export type PaginateParams<T> = {
    items: T[];
    limit: number;
    getId: (item: T) => string;
};

export type PaginateOutput<T> = {
    items: T[];
    meta: PaginationResult;
};

export type PaginationArgs = {
    take: number;
    skip?: number;
    cursor?: { id: string };
};
