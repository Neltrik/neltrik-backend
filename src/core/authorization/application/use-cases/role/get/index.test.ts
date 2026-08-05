import { Role } from "../../../../domain/entities";
import { RoleNotFoundError } from "../../../../domain/errors";
import { RoleRepositorySpy } from "../../../../test-doubles";
import { GetRoleUseCase } from "./index";

const makeRole = () =>
    Role.create({
        id: "role-id",
        code: "TENANT_ADMIN",
        defaultDisplayName: "Tenant Admin",
        description: "Tenant administrator.",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

describe("GetRoleUseCase", () => {
    const makeSut = () => {
        const roleRepository = new RoleRepositorySpy();
        roleRepository.get.mockResolvedValue(makeRole());
        const useCase = new GetRoleUseCase(roleRepository);
        return { useCase, roleRepository };
    };

    it("should return a role successfully", async () => {
        const { useCase, roleRepository } = makeSut();
        const role = await useCase.execute("role-id");
        expect(roleRepository.get).toHaveBeenCalledTimes(1);
        expect(roleRepository.get).toHaveBeenCalledWith("role-id");
        expect(role.id).toBe("role-id");
    });

    it("should throw RoleNotFoundError when role does not exist", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.get.mockResolvedValue(null);
        await expect(useCase.execute("role-id")).rejects.toThrow(RoleNotFoundError);
    });

    it("should propagate repository errors", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.get.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("role-id")).rejects.toThrow("Database error");
    });
});
