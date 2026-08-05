import { Permission } from "../../../../domain/entities";
import { PermissionNotFoundError } from "../../../../domain/errors";
import { PermissionRepositorySpy } from "../../../../test-doubles";
import { UpdatePermissionUseCase } from "./index";
import type { UpdatePermissionInput } from "./input";

const makePermission = () =>
    Permission.create({
        id: "permission-id",
        code: "USER_CREATE",
        description: "Allows creating users.",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

const makeInput = (): UpdatePermissionInput => ({
    id: "permission-id",
    description: "Updated description.",
});

describe("UpdatePermissionUseCase", () => {
    const makeSut = () => {
        const permissionRepository = new PermissionRepositorySpy();
        permissionRepository.get.mockResolvedValue(makePermission());
        permissionRepository.update.mockResolvedValue(undefined);
        const useCase = new UpdatePermissionUseCase(permissionRepository);
        return { useCase, permissionRepository };
    };

    it("should update a permission successfully", async () => {
        const { useCase, permissionRepository } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(permissionRepository.get).toHaveBeenCalledTimes(1);
        expect(permissionRepository.get).toHaveBeenCalledWith("permission-id");
        expect(permissionRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: "permission-id" });
    });

    it("should update only description", async () => {
        const { useCase, permissionRepository } = makeSut();
        await useCase.execute({ id: "permission-id", description: "New description" });
        const permission = permissionRepository.update.mock.calls[0]?.[0];
        expect(permission?.description).toBe("New description");
        expect(permission?.code).toBe("USER_CREATE");
    });

    it("should throw PermissionNotFoundError when permission does not exist", async () => {
        const { useCase, permissionRepository } = makeSut();
        permissionRepository.get.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(PermissionNotFoundError);
        expect(permissionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository update errors", async () => {
        const { useCase, permissionRepository } = makeSut();
        permissionRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });

    it("should propagate repository get errors", async () => {
        const { useCase, permissionRepository } = makeSut();
        permissionRepository.get.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(permissionRepository.update).not.toHaveBeenCalled();
    });
});
