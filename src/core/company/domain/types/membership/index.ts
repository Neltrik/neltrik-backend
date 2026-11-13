import type { PaginationInput } from "@/shared/pagination";

export const MEMBERSHIP_STATUS = {
    PENDING: "PENDING",
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    REVOKED: "REVOKED",
} as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUS)[keyof typeof MEMBERSHIP_STATUS];
export const MEMBERSHIP_STATUSES: readonly MembershipStatus[] = Object.values(MEMBERSHIP_STATUS);

export type MembershipProps = {
    id: string;
    tenantId: string;
    userId: string;
    companyId: string;
    roleId: string;
    status: MembershipStatus;
    createdAt: Date;
    updatedAt: Date;
};

export interface FindByCompanyParams extends PaginationInput {
    companyId: string;
}

export interface FindByUserParams extends PaginationInput {
    userId: string;
    status?: MembershipStatus | undefined;
}
