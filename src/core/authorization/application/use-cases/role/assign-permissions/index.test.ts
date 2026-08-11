import { Role } from "../../../../domain/entities";
import { PermissionNotFoundError, RoleNotFoundError } from "../../../../domain/errors";
import { PermissionRepositorySpy, RoleRepositorySpy, TransactionManagerSpy } from "../../../../test-doubles";
import { AssignPermissionsToRoleUseCase } from "./index";

const makeRole = () =>
    Role.create({
        id: "role-id",
        code: "TENANT_ADMIN",
        defaultDisplayName: "Tenant Admin",
        description: "Tenant administrator.",
        permissionIds: [],
        scope: "PLATFORM",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

describe("AssignPermissionsToRoleUseCase", () => {
    const makeSut = () => {
        const roleRepository = new RoleRepositorySpy();
        const permissionRepository = new PermissionRepositorySpy();
        const transactionManager = new TransactionManagerSpy();
        const role = makeRole();
        roleRepository.get.mockResolvedValue(role);
        permissionRepository.getByIds.mockResolvedValue([]);
        const useCase = new AssignPermissionsToRoleUseCase(roleRepository, permissionRepository, transactionManager);
        return { useCase, roleRepository, permissionRepository, transactionManager, role };
    };

    it("should assign multiple permissions successfully", async () => {
        const { useCase, roleRepository, permissionRepository, transactionManager } = makeSut();
        const permissionIds = ["permission-1", "permission-2"];
        permissionRepository.getByIds.mockResolvedValue(permissionIds.map((id) => ({ id }) as never));
        const result = await useCase.execute({ roleId: "role-id", permissionIds });
        expect(transactionManager.execute).toHaveBeenCalledTimes(1);
        expect(roleRepository.get).toHaveBeenCalledWith("role-id");
        expect(permissionRepository.getByIds).toHaveBeenCalledWith(permissionIds);
        expect(roleRepository.assignPermissions).toHaveBeenCalledTimes(1);
        expect(roleRepository.assignPermissions).toHaveBeenCalledWith("role-id", permissionIds, expect.anything());
        expect(result).toEqual({ id: "role-id" });
    });

    it("should reject the operation when the role does not exist", async () => {
        const { useCase, roleRepository, permissionRepository } = makeSut();
        roleRepository.get.mockResolvedValue(null);
        await expect(useCase.execute({ roleId: "role-id", permissionIds: ["permission-1"] })).rejects.toThrow(
            RoleNotFoundError,
        );
        expect(permissionRepository.getByIds).not.toHaveBeenCalled();
    });

    it("should reject the operation when at least one permission does not exist", async () => {
        const { useCase, permissionRepository, roleRepository } = makeSut();
        permissionRepository.getByIds.mockResolvedValue([{ id: "permission-1" } as never]);
        await expect(
            useCase.execute({ roleId: "role-id", permissionIds: ["permission-1", "permission-2"] }),
        ).rejects.toThrow(PermissionNotFoundError);
        expect(roleRepository.assignPermissions).not.toHaveBeenCalled();
    });

    it("should remove duplicated permission ids from the input", async () => {
        const { useCase, permissionRepository, roleRepository } = makeSut();
        permissionRepository.getByIds.mockResolvedValue([
            { id: "permission-1" } as never,
            { id: "permission-2" } as never,
        ]);
        await useCase.execute({
            roleId: "role-id",
            permissionIds: ["permission-1", "permission-1", "permission-2"],
        });
        expect(permissionRepository.getByIds).toHaveBeenCalledWith(["permission-1", "permission-2"]);
        expect(roleRepository.assignPermissions).toHaveBeenCalledWith(
            "role-id",
            ["permission-1", "permission-2"],
            expect.anything(),
        );
    });

    it("should propagate repository errors", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.get.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute({ roleId: "role-id", permissionIds: ["permission-1"] })).rejects.toThrow(
            "Database error",
        );
    });
});
