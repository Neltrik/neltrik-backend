export const PERMISSION_SCOPE = {
    PLATFORM: "PLATFORM",
    TENANT: "TENANT",
} as const;
export type PermissionScope = (typeof PERMISSION_SCOPE)[keyof typeof PERMISSION_SCOPE];

export type PermissionProps = {
    id: string;
    code: string;
    description: string;
    scope: PermissionScope;
    createdAt: Date;
    updatedAt: Date;
};
