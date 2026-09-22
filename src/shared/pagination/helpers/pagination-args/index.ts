import { type PaginationArgs } from "../../types";

export function withPaginationArgs({ cursor, limit }: { cursor?: string; limit: number }): PaginationArgs {
    const args: PaginationArgs = { take: limit + 1 };
    if (cursor) {
        args.skip = 1;
        args.cursor = { id: cursor };
    }
    return args;
}
