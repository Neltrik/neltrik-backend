import type { GetUserRequestDto } from "@/core/identity/api";

import { Permission } from "../../../../domain/entities";
import { RoleRepositorySpy, UserApiSpy } from "../../../../test-doubles";
import { UserHasPermissionUseCase } from "./index";

describe("UserHasPermissionUseCase", () => {
    const makeSut = () => {
        const userApi = new UserApiSpy();
        const roleRepository = new RoleRepositorySpy();
        userApi.getUserById.mockResolvedValue({
            id: "user-id",
            roleId: "role-id",
        } as GetUserRequestDto);
        const permission = Permission.create({
            id: "permission-id",
            code: "USER_CREATE",
            description: "Allows creating users.",
            scope: "PLATFORM",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        roleRepository.getPermissionsByRole.mockResolvedValue([permission]);
        const useCase = new UserHasPermissionUseCase(userApi, roleRepository);
        return { useCase, userApi, roleRepository, permission };
    };

    it("should return true when user has the permission", async () => {
        const { useCase, userApi, roleRepository } = makeSut();
        const result = await useCase.execute({ userId: "user-id", code: "USER_CREATE" });
        expect(userApi.getUserById).toHaveBeenCalledTimes(1);
        expect(userApi.getUserById).toHaveBeenCalledWith("user-id");
        expect(roleRepository.getPermissionsByRole).toHaveBeenCalledTimes(1);
        expect(roleRepository.getPermissionsByRole).toHaveBeenCalledWith("role-id");
        expect(result).toBe(true);
    });

    it("should return false when user does not have the permission", async () => {
        const { useCase, userApi, roleRepository } = makeSut();
        const result = await useCase.execute({ userId: "user-id", code: "USER_DELETE" });
        expect(userApi.getUserById).toHaveBeenCalledTimes(1);
        expect(userApi.getUserById).toHaveBeenCalledWith("user-id");
        expect(roleRepository.getPermissionsByRole).toHaveBeenCalledTimes(1);
        expect(roleRepository.getPermissionsByRole).toHaveBeenCalledWith("role-id");
        expect(result).toBe(false);
    });

    it("should return false when user has no permissions", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.getPermissionsByRole.mockResolvedValue([]);
        const result = await useCase.execute({ userId: "user-id", code: "USER_CREATE" });
        expect(result).toBe(false);
    });

    it("should propagate userApi getUserById errors", async () => {
        const { useCase, userApi, roleRepository } = makeSut();
        userApi.getUserById.mockRejectedValue(new Error("User not found"));
        await expect(useCase.execute({ userId: "user-id", code: "USER_CREATE" })).rejects.toThrow("User not found");
        expect(roleRepository.getPermissionsByRole).not.toHaveBeenCalled();
    });

    it("should propagate roleRepository getPermissionsByRole errors", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.getPermissionsByRole.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute({ userId: "user-id", code: "USER_CREATE" })).rejects.toThrow("Database error");
    });
});
