export const ROLE_SCOPE = {
    PLATFORM: "PLATFORM",
    TENANT: "TENANT",
} as const;
export type RoleScope = (typeof ROLE_SCOPE)[keyof typeof ROLE_SCOPE];

export type RoleProps = {
    id: string;
    code: string;
    defaultDisplayName: string;
    description: string;
    permissionIds: string[];
    scope: RoleScope;
    createdAt: Date;
    updatedAt: Date;
};
