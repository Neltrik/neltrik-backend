import { Permission, Role } from "../../../../domain/entities";
import { RoleNotFoundError } from "../../../../domain/errors";
import { RoleRepositorySpy } from "../../../../test-doubles";
import { GetPermissionsByRoleUseCase } from "./index";

const makeRole = () =>
    Role.create({
        id: "role-id",
        code: "TENANT_ADMIN",
        defaultDisplayName: "Tenant Admin",
        description: "Tenant administrator.",
        permissionIds: [],
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

const makePermission = (id: string, code: string) =>
    Permission.create({
        id,
        code,
        description: `${code} permission.`,
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

describe("GetPermissionsByRoleUseCase", () => {
    const makeSut = () => {
        const roleRepository = new RoleRepositorySpy();
        roleRepository.get.mockResolvedValue(makeRole());
        roleRepository.getPermissionsByRole.mockResolvedValue([
            makePermission("permission-id-1", "ROLE_CREATE"),
            makePermission("permission-id-2", "ROLE_UPDATE"),
        ]);
        const useCase = new GetPermissionsByRoleUseCase(roleRepository);
        return { useCase, roleRepository };
    };

    it("should return permissions successfully", async () => {
        const { useCase, roleRepository } = makeSut();
        const permissions = await useCase.execute("role-id");
        expect(roleRepository.get).toHaveBeenCalledTimes(1);
        expect(roleRepository.get).toHaveBeenCalledWith("role-id");
        expect(roleRepository.getPermissionsByRole).toHaveBeenCalledTimes(1);
        expect(roleRepository.getPermissionsByRole).toHaveBeenCalledWith("role-id");
        expect(permissions).toHaveLength(2);
        expect(permissions[0]?.code).toBe("ROLE_CREATE");
        expect(permissions[1]?.code).toBe("ROLE_UPDATE");
    });

    it("should return an empty list when the role has no permissions", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.getPermissionsByRole.mockResolvedValue([]);
        const permissions = await useCase.execute("role-id");
        expect(permissions).toEqual([]);
        expect(roleRepository.getPermissionsByRole).toHaveBeenCalledTimes(1);
    });

    it("should throw RoleNotFoundError when the role does not exist", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.get.mockResolvedValue(null);
        await expect(useCase.execute("role-id")).rejects.toThrow(RoleNotFoundError);
        expect(roleRepository.getPermissionsByRole).not.toHaveBeenCalled();
    });

    it("should propagate role repository errors", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.get.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("role-id")).rejects.toThrow("Database error");
    });

    it("should propagate permission query errors", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.getPermissionsByRole.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("role-id")).rejects.toThrow("Database error");
    });
});
