import type { CompanyStatus } from "../../../../../domain/types";

export interface SuspendCompanyOutput {
    id: string;
    tenantId: string;
    name: string;
    slug: string;
    status: CompanyStatus;
    createdAt: Date;
    updatedAt: Date;
}
