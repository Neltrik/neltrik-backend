export const ERROR_MESSAGES = {
    INVALID_TENANT_NAME: "The tenant name is invalid.",
    INVALID_TENANT_TYPE: "The tenant type is invalid.",
    INVALID_TENANT_SLUG: "The tenant slug is invalid.",
    TENANT_NOT_FOUND: "Tenant not found.",
    TENANT_ALREADY_SUSPENDED: "The tenant is already suspended.",
    TENANT_ALREADY_ACTIVE: "The tenant is already active.",
    EMPTY_RECIPIENT: "The recipient cannot be empty.",
    INVALID_RECIPIENT: "The recipient is invalid.",
    EMPTY_TOKEN: "The token cannot be empty.",
    INVALID_TOKEN_FORMAT: "The token format is invalid.",
    EXPIRATION_DATE_IN_PAST: "The expiration date cannot be in the past.",
    INVALID_EXPIRATION_DATE: "The expiration date is invalid.",
} as const;

export const DOMAIN_ERROR_CODES = {
    INVALID_TENANT_NAME: "INVALID_TENANT_NAME",
    INVALID_TENANT_SLUG: "INVALID_TENANT_SLUG",
    TENANT_NOT_FOUND: "TENANT_NOT_FOUND",
    TENANT_ALREADY_SUSPENDED: "TENANT_ALREADY_SUSPENDED",
    TENANT_ALREADY_ACTIVE: "TENANT_ALREADY_ACTIVE",
    INVALID_TENANT_TYPE: "INVALID_TENANT_TYPE",
    EMPTY_RECIPIENT: "EMPTY_RECIPIENT",
    INVALID_RECIPIENT: "INVALID_RECIPIENT",
    EMPTY_TOKEN: "EMPTY_TOKEN",
    INVALID_TOKEN_FORMAT: "INVALID_TOKEN_FORMAT",
    EXPIRATION_DATE_IN_PAST: "EXPIRATION_DATE_IN_PAST",
    INVALID_EXPIRATION_DATE: "INVALID_EXPIRATION_DATE",
} as const;
