export const AUDIT_RESOURCE = {
    // Identity
    USER: "USER",

    // Tenant
    TENANT: "TENANT",
} as const;

export type AuditResource = (typeof AUDIT_RESOURCE)[keyof typeof AUDIT_RESOURCE];
