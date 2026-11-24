import {
    type DeleteUserResultDto,
    type GetUserRequestDto,
    type RegisterUserRequestDto,
    type RegisterUserResultDto,
    UserApi,
} from "@/core/identity/api";
import { NotificationApi, type SendNotificationDto } from "@/core/notifications/api";
import { TenantApi, type TenantResultDto } from "@/core/tenant/api";

export class TenantApiSpy extends TenantApi {
    public validate = jest.fn<Promise<void>, [string]>();
    public getById = jest.fn<Promise<TenantResultDto>, [string]>();
    public isPlatformTenant = jest.fn<Promise<boolean>, [string]>();
    public list = jest.fn<Promise<TenantResultDto[]>, [void]>();
}

export class UserApiSpy extends UserApi {
    public create = jest.fn<Promise<RegisterUserResultDto>, [RegisterUserRequestDto]>();
    public validateUserById = jest.fn<Promise<void>, [string]>();
    public delete = jest.fn<Promise<DeleteUserResultDto>, [string]>();
    public getUserById = jest.fn<Promise<GetUserRequestDto>, [string]>();
}

export class NotificationApiSpy extends NotificationApi {
    public send = jest.fn<Promise<string>, [SendNotificationDto]>();
}

export class AuthorizationRoleApiSpy {
    public getRolesByTenantId = jest.fn();
    public validate = jest.fn<Promise<void>, [string]>();
    public validateForTenant = jest.fn<Promise<void>, [{ roleId: string; tenantId: string }]>();
    public getRoleById = jest.fn<Promise<{ id: string; code: string; scope: "PLATFORM" | "TENANT" }>, [string]>();
}
