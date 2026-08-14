import { Permission, Role } from "../../../../domain/entities";
import { RoleNotFoundError } from "../../../../domain/errors";
import { RoleRepositorySpy } from "../../../../test-doubles";
import { GetRoleUseCase } from "./index";

const makeRole = () =>
    Role.create({
        id: "role-id",
        code: "TENANT_ADMIN",
        defaultDisplayName: "Tenant Admin",
        description: "Tenant administrator.",
        permissionIds: ["permission-id-1", "permission-id-2"],
        scope: "TENANT",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

const makePermission = (id: string, code: string) =>
    Permission.create({
        id,
        code,
        description: `${code} permission.`,
        scope: "TENANT",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

describe("GetRoleUseCase", () => {
    const makeSut = () => {
        const roleRepository = new RoleRepositorySpy();
        roleRepository.get.mockResolvedValue(makeRole());
        roleRepository.getPermissionsByRole.mockResolvedValue([
            makePermission("permission-id-1", "USER_CREATE"),
            makePermission("permission-id-2", "USER_UPDATE"),
        ]);
        const useCase = new GetRoleUseCase(roleRepository);
        return { useCase, roleRepository };
    };

    it("should return role details with permissions successfully", async () => {
        const { useCase, roleRepository } = makeSut();
        const role = await useCase.execute("role-id");
        expect(roleRepository.get).toHaveBeenCalledTimes(1);
        expect(roleRepository.get).toHaveBeenCalledWith("role-id");
        expect(roleRepository.getPermissionsByRole).toHaveBeenCalledTimes(1);
        expect(roleRepository.getPermissionsByRole).toHaveBeenCalledWith("role-id");
        expect(role.id).toBe("role-id");
        expect(role.code).toBe("TENANT_ADMIN");
        expect(role.defaultDisplayName).toBe("Tenant Admin");
        expect(role.description).toBe("Tenant administrator.");
        expect(role.scope).toBe("TENANT");
        expect(role.permissions).toHaveLength(2);
        expect(role.permissions[0]?.code).toBe("USER_CREATE");
        expect(role.permissions[1]?.code).toBe("USER_UPDATE");
    });

    it("should return an empty permissions list when the role has no permissions", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.getPermissionsByRole.mockResolvedValue([]);
        const role = await useCase.execute("role-id");
        expect(role.permissions).toEqual([]);
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
        expect(roleRepository.getPermissionsByRole).not.toHaveBeenCalled();
    });

    it("should propagate permission query errors", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.getPermissionsByRole.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("role-id")).rejects.toThrow("Database error");
    });
});
