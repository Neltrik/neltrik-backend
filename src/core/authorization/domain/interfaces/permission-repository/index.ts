import { type Permission } from "../../entities";

export abstract class PermissionRepository {
    abstract create(permission: Permission): Promise<void>;
    abstract update(permission: Permission): Promise<void>;
    abstract get(id: string): Promise<Permission | null>;
    abstract list(): Promise<Permission[]>;
    abstract existsByCode(code: string): Promise<boolean>;
}
