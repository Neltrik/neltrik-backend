import type {
    DeleteUserResultDto,
    GetUserRequestDto,
    RegisterUserRequestDto,
    RegisterUserResultDto,
} from "@/core/identity/api";
import { TenantApi } from "@/core/tenant/api";

export class AuthorizationRoleApiSpy {
    public getRolesByTenantId = jest.fn();
    public validate = jest.fn<Promise<void>, [string]>();
    public validateForTenant = jest.fn<Promise<void>, [{ roleId: string; tenantId: string }]>();
    public getRoleById = jest.fn<Promise<{ id: string; code: string; scope: "PLATFORM" | "TENANT" }>, [string]>();
}

export class TenantApiSpy extends TenantApi {
    public validate = jest.fn<Promise<void>, [string]>();
    public isPlatformTenant = jest.fn<Promise<boolean>, [string]>();
}

export class UserApiSpy {
    public create = jest.fn<Promise<RegisterUserResultDto>, [RegisterUserRequestDto]>();
    public validateUserById = jest.fn<Promise<void>, [string]>();
    public delete = jest.fn<Promise<DeleteUserResultDto>, [string]>();
    public getUserById = jest.fn<Promise<GetUserRequestDto>, [string]>();
}
