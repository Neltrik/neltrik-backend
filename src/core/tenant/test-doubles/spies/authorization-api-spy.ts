import { AuthorizationApi } from "@/core/authorization/api";

export class AuthorizationApiSpy extends AuthorizationApi {
    public getRolesByTenantId = jest.fn();
}
