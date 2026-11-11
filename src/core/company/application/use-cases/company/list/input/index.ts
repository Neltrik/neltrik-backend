import { type PaginationInput } from "@/shared/pagination";

export interface ListCompaniesInput extends PaginationInput {
    actorTenantId: string;
}
