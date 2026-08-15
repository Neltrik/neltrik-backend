const ROLE_HIERARCHY: Record<string, number> = {
    PLATFORM_ADMIN: 3,
    TENANT_OWNER: 2,
    TENANT_ADMIN: 1,
};

function getRoleHierarchy(roleCode: string): number {
    return ROLE_HIERARCHY[roleCode] ?? 0;
}

function isRoleHigherThan(actorRole: string, targetRole: string): boolean {
    return getRoleHierarchy(actorRole) > getRoleHierarchy(targetRole);
}

export class UserSuspensionPolicy {
    public static canSuspend(actorRole: string, targetRole: string): boolean {
        return isRoleHigherThan(actorRole, targetRole);
    }
}
