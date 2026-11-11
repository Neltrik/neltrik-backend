import type { PaginationInput } from "@/shared/pagination";

export const COMPANY_STATUS = {
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
} as const;
export type CompanyStatus = (typeof COMPANY_STATUS)[keyof typeof COMPANY_STATUS];
export const COMPANY_STATUSES: readonly CompanyStatus[] = Object.values(COMPANY_STATUS);

export type CompanyProps = {
    id: string;
    tenantId: string;
    name: string;
    slug: string;
    status: CompanyStatus;
    createdAt: Date;
    updatedAt: Date;
};

export interface FindByTenantParams extends PaginationInput {
    tenantId: string;
}
