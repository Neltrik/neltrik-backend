export const TENANT_STATUS = {
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
} as const;

export type TenantStatus = (typeof TENANT_STATUS)[keyof typeof TENANT_STATUS];
