import { Permission } from "../../../../domain/entities";
import { PermissionRepositorySpy } from "../../../../test-doubles";
import { ListPermissionsUseCase } from "./index";

const makePermission = () =>
    Permission.create({
        id: "permission-id",
        code: "USER_CREATE",
        description: "Allows creating users.",
        scope: "PLATFORM",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

describe("ListPermissionsUseCase", () => {
    const makeSut = () => {
        const permissionRepository = new PermissionRepositorySpy();
        permissionRepository.list.mockResolvedValue([makePermission()]);
        const useCase = new ListPermissionsUseCase(permissionRepository);
        return { useCase, permissionRepository };
    };

    it("should return permissions successfully", async () => {
        const { useCase, permissionRepository } = makeSut();
        const result = await useCase.execute();
        expect(permissionRepository.list).toHaveBeenCalledTimes(1);
        expect(result).toHaveLength(1);
    });

    it("should return an empty list", async () => {
        const { useCase, permissionRepository } = makeSut();
        permissionRepository.list.mockResolvedValue([]);
        const result = await useCase.execute();
        expect(result).toEqual([]);
    });

    it("should propagate repository errors", async () => {
        const { useCase, permissionRepository } = makeSut();
        permissionRepository.list.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute()).rejects.toThrow("Database error");
    });
});
