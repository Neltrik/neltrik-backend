export abstract class PermissionChecker {
    public abstract hasPermission(userId: string, permission: string): Promise<boolean>;
}
