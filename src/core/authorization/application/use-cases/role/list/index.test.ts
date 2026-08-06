import { Role } from "../../../../domain/entities";
import { RoleRepositorySpy } from "../../../../test-doubles";
import { ListRolesUseCase } from "./index";

const makeRole = () =>
    Role.create({
        id: "role-id",
        code: "TENANT_ADMIN",
        defaultDisplayName: "Tenant Admin",
        description: "Tenant administrator.",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

describe("ListRolesUseCase", () => {
    const makeSut = () => {
        const roleRepository = new RoleRepositorySpy();
        roleRepository.list.mockResolvedValue([makeRole()]);
        const useCase = new ListRolesUseCase(roleRepository);
        return { useCase, roleRepository };
    };

    it("should return roles successfully", async () => {
        const { useCase, roleRepository } = makeSut();
        const result = await useCase.execute();
        expect(roleRepository.list).toHaveBeenCalledTimes(1);
        expect(result).toHaveLength(1);
    });

    it("should return an empty list", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.list.mockResolvedValue([]);
        const result = await useCase.execute();
        expect(result).toEqual([]);
    });

    it("should propagate repository errors", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.list.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute()).rejects.toThrow("Database error");
    });
});
