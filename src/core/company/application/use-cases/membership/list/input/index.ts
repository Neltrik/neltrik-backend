import type { PaginationInput } from "@/shared/pagination";

export interface ListMembersInput extends PaginationInput {
    companyId: string;
}
