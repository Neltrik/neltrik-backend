import { type Permission } from "../../domain/entities";
import { PermissionRepository } from "../../domain/interfaces";

export class PermissionRepositorySpy extends PermissionRepository {
    public create = jest.fn<Promise<void>, [Permission]>();
    public update = jest.fn<Promise<void>, [Permission]>();
    public get = jest.fn<Promise<Permission | null>, [string]>();
    public list = jest.fn<Promise<Permission[]>, []>();
    public existsByCode = jest.fn<Promise<boolean>, [string]>();
}
