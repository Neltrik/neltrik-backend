export const TENANT_TYPE = {
    PLATFORM: "PLATFORM",
    CUSTOMER: "CUSTOMER",
} as const;

export type TenantType = (typeof TENANT_TYPE)[keyof typeof TENANT_TYPE];
