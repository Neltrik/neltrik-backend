export const ERROR_MESSAGES = {
    INVALID_TENANT_NAME: "The tenant name is invalid.",
    INVALID_TENANT_SLUG: "The tenant slug is invalid.",
    TENANT_NOT_FOUND: "Tenant not found.",
    TENANT_ALREADY_SUSPENDED: "The tenant is already suspended.",
    TENANT_ALREADY_ACTIVE: "The tenant is already active.",
} as const;

export const DOMAIN_ERROR_CODES = {
    INVALID_TENANT_NAME: "INVALID_TENANT_NAME",
    INVALID_TENANT_SLUG: "INVALID_TENANT_SLUG",
    TENANT_NOT_FOUND: "TENANT_NOT_FOUND",
    TENANT_ALREADY_SUSPENDED: "TENANT_ALREADY_SUSPENDED",
    TENANT_ALREADY_ACTIVE: "TENANT_ALREADY_ACTIVE",
} as const;
