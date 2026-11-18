import type { PaginationResult } from "@/shared/pagination";

import type { Membership } from "../../../../../domain/entities";

export type ListMembersOutput = {
    memberships: Membership[];
    meta: PaginationResult;
};
