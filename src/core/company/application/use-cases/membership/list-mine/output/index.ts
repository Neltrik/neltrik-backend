import type { PaginationResult } from "@/shared/pagination";

import type { Membership } from "../../../../../domain/entities";

export type ListMyMembershipsOutput = {
    memberships: Membership[];
    meta: PaginationResult;
};
