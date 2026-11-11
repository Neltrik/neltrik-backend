import { type PaginationResult } from "@/shared/pagination";

import type { Company } from "../../../../../domain/entities";

export type ListCompaniesOutput = {
    companies: Company[];
    meta: PaginationResult;
};
