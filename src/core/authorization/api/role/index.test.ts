import { ROLE_SCOPE } from "../../domain/types";
import { GetRolesByTenantOhsUseCaseSpy } from "../../test-doubles";
import { AuthorizationRoleApiImpl, RoleResultDto } from "./index";

const makeRole = (id = "role-id") => ({
    id,
    code: "RECRUITER",
    defaultDisplayName: "Recruiter",
    description: "Role for recruiters",
    scope: ROLE_SCOPE.TENANT,
});

describe("AuthorizationRoleApiImpl", () => {
    const makeSut = () => {
        const getRolesByTenantOhsUseCase = new GetRolesByTenantOhsUseCaseSpy();
        const authorizationRoleApi = new AuthorizationRoleApiImpl(getRolesByTenantOhsUseCase);
        return { authorizationRoleApi, getRolesByTenantOhsUseCase };
    };

    describe("getRolesByTenantId", () => {
        it("should return the roles enabled for the tenant", async () => {
            const { authorizationRoleApi, getRolesByTenantOhsUseCase } = makeSut();
            getRolesByTenantOhsUseCase.execute.mockResolvedValue([makeRole("role-1"), makeRole("role-2")]);
            await expect(authorizationRoleApi.getRolesByTenantId("tenant-id")).resolves.toEqual([
                {
                    id: "role-1",
                    code: "RECRUITER",
                    defaultDisplayName: "Recruiter",
                    description: "Role for recruiters",
                    scope: ROLE_SCOPE.TENANT,
                },
                {
                    id: "role-2",
                    code: "RECRUITER",
                    defaultDisplayName: "Recruiter",
                    description: "Role for recruiters",
                    scope: ROLE_SCOPE.TENANT,
                },
            ]);
            expect(getRolesByTenantOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(getRolesByTenantOhsUseCase.execute).toHaveBeenCalledWith("tenant-id");
        });

        it("should return an empty array when the tenant has no roles enabled", async () => {
            const { authorizationRoleApi, getRolesByTenantOhsUseCase } = makeSut();
            getRolesByTenantOhsUseCase.execute.mockResolvedValue([]);
            await expect(authorizationRoleApi.getRolesByTenantId("tenant-id")).resolves.toEqual([]);
            expect(getRolesByTenantOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(getRolesByTenantOhsUseCase.execute).toHaveBeenCalledWith("tenant-id");
        });

        it("should propagate role retrieval errors", async () => {
            const { authorizationRoleApi, getRolesByTenantOhsUseCase } = makeSut();
            getRolesByTenantOhsUseCase.execute.mockRejectedValue(new Error("Tenant not found"));
            await expect(authorizationRoleApi.getRolesByTenantId("tenant-id")).rejects.toThrow("Tenant not found");
            expect(getRolesByTenantOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(getRolesByTenantOhsUseCase.execute).toHaveBeenCalledWith("tenant-id");
        });
    });
});

describe("RoleResultDto", () => {
    it("should create a role result dto", () => {
        const dto = new RoleResultDto();
        dto.id = "role-id";
        dto.code = "RECRUITER";
        dto.defaultDisplayName = "Recruiter";
        dto.description = "Role for recruiters";
        dto.scope = ROLE_SCOPE.TENANT;
        expect(dto).toEqual({
            id: "role-id",
            code: "RECRUITER",
            defaultDisplayName: "Recruiter",
            description: "Role for recruiters",
            scope: ROLE_SCOPE.TENANT,
        });
    });
});
