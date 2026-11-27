import {
    CompanyApi,
    type CreateCompanyResponseDto,
    type CreateCompanyResultDto,
    MembershipApi,
    type MembershipResultDto,
} from "@/core/company/api";
import type {
    DeleteUserResultDto,
    GetUserRequestDto,
    RegisterUserRequestDto,
    RegisterUserResultDto,
} from "@/core/identity/api";

export class AuthorizationRoleApiSpy {
    public getRolesByTenantId = jest.fn();
    public validate = jest.fn<Promise<void>, [string]>();
    public validateForTenant = jest.fn<Promise<void>, [{ roleId: string; tenantId: string }]>();
    public getRoleById = jest.fn<Promise<{ id: string; code: string; scope: "PLATFORM" | "TENANT" }>, [string]>();
}

export class UserApiSpy {
    public create = jest.fn<Promise<RegisterUserResultDto>, [RegisterUserRequestDto]>();
    public validateUserById = jest.fn<Promise<void>, [string]>();
    public delete = jest.fn<Promise<DeleteUserResultDto>, [string]>();
    public getUserById = jest.fn<Promise<GetUserRequestDto>, [string]>();
}

export class CompanyApiSpy extends CompanyApi {
    public create = jest.fn<Promise<CreateCompanyResponseDto>, [CreateCompanyResultDto]>();
    public delete = jest.fn<Promise<void>, [string]>();
}

export class MembershipApiSpy extends MembershipApi {
    public create = jest.fn<Promise<void>, [MembershipResultDto]>();
}
