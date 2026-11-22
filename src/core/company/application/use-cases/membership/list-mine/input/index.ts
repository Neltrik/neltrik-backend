import type { PaginationInput } from "@/shared/pagination";

import type { MembershipStatus } from "../../../../../domain/types";

export interface ListMyMembershipsInput extends PaginationInput {
    actorUserId: string;
    status?: MembershipStatus | undefined;
}
