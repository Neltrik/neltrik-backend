export const ERROR_MESSAGES = {
    INVALID_AUDIT_METADATA: "Audit metadata must be a JSON object",
    INVALID_IP_ADDRESS: "IP address is invalid",
    EMPTY_ACTION: "Action must not be empty",
    EMPTY_RESOURCE: "Resource must not be empty",
    INVALID_AUDIT_ACTION: "Audit action is invalid",
    INVALID_AUDIT_RESOURCE: "Audit resource is invalid",
} as const;

export const DOMAIN_ERROR_CODES = {
    INVALID_AUDIT_METADATA: "INVALID_AUDIT_METADATA",
    INVALID_IP_ADDRESS: "INVALID_IP_ADDRESS",
    EMPTY_ACTION: "EMPTY_ACTION",
    EMPTY_RESOURCE: "EMPTY_RESOURCE",
    INVALID_AUDIT_ACTION: "INVALID_AUDIT_ACTION",
    INVALID_AUDIT_RESOURCE: "INVALID_AUDIT_RESOURCE",
} as const;
