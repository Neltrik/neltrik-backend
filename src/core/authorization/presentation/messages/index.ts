export const ROLE_MESSAGES = {
    CREATED: "Role created successfully.",
    UPDATED: "Role updated successfully.",
    LISTED: "Role listed successfully.",
    ASSIGNED: "Permissions assigned to role successfully.",
    REMOVED: "Permissions removed from role successfully.",
} as const;

export const PERMISSION_MESSAGES = {
    CREATED: "Permission created successfully.",
    UPDATED: "Permission updated successfully.",
    LISTED: "Permission listed successfully.",
} as const;

export const TENANT_ROLE_CONFIGURATION_MESSAGES = {
    CREATED: "Permission created successfully.",
    UPDATED: "Permission updated successfully.",
    LISTED: "Permission listed successfully.",
    DELETED: "Permission deleted successfully.",
} as const;

export const ROLE_TENANT_MESSAGES = {
    ASSOCIATED: "Role associated with tenant successfully.",
    DISASSOCIATED: "Role disassociated from tenant successfully.",
    LISTED: "Tenant roles listed successfully.",
} as const;
