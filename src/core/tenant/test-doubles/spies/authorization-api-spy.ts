import { AuthorizationRoleApi } from "@/core/authorization/api";

export class AuthorizationRoleApiSpy extends AuthorizationRoleApi {
    public getRolesByTenantId = jest.fn();
}
