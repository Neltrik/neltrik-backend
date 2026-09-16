export const ERROR_MESSAGES = {
    INVALID_AUDIT_METADATA: "Audit metadata must be a JSON object",
    INVALID_IP_ADDRESS: "IP address is invalid",
    EMPTY_ACTION: "Action must not be empty",
    EMPTY_RESOURCE: "Resource must not be empty",
} as const;

export const DOMAIN_ERROR_CODES = {
    INVALID_AUDIT_METADATA: "INVALID_AUDIT_METADATA",
    INVALID_IP_ADDRESS: "INVALID_IP_ADDRESS",
    EMPTY_ACTION: "EMPTY_ACTION",
    EMPTY_RESOURCE: "EMPTY_RESOURCE",
} as const;
