import { type TenantRoleConfiguration } from "../../domain/entities";
import { TenantRoleConfigurationRepository } from "../../domain/interfaces";

export class TenantRoleConfigurationRepositorySpy extends TenantRoleConfigurationRepository {
    public create = jest.fn<Promise<TenantRoleConfiguration>, [TenantRoleConfiguration]>();
    public update = jest.fn<Promise<TenantRoleConfiguration>, [TenantRoleConfiguration]>();
    public delete = jest.fn<Promise<void>, [string]>();
    public get = jest.fn<Promise<TenantRoleConfiguration | null>, [string]>();
    public findByTenantAndRole = jest.fn<Promise<TenantRoleConfiguration | null>, [string, string]>();
    public list = jest.fn<Promise<TenantRoleConfiguration[]>, [string]>();
}
