import type { PaginationInput } from "@/shared/pagination";

export interface ListMembersInput extends PaginationInput {
    actorUserId: string;
    actorTenantId: string;
    companyId: string;
}
