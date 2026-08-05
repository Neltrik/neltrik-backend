import { Role } from "../../../../domain/entities";
import { RoleNotFoundError } from "../../../../domain/errors";
import type { RoleProps } from "../../../../domain/types";
import { RoleRepositorySpy } from "../../../../test-doubles";
import { UpdateRoleUseCase } from "./index";
import type { UpdateRoleInput } from "./input";

const createProps = (): RoleProps => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "role-id",
        code: "TENANT_ADMIN",
        defaultDisplayName: "Tenant Admin",
        description: "Tenant administrator.",
        createdAt,
        updatedAt: createdAt,
    };
};

const makeInput = (): UpdateRoleInput => ({
    id: "role-id",
    defaultDisplayName: "Platform Admin",
    description: "Platform administrator.",
});

describe("UpdateRoleUseCase", () => {
    const makeSut = () => {
        const roleRepository = new RoleRepositorySpy();
        roleRepository.get.mockResolvedValue(Role.restore(createProps()));
        roleRepository.update.mockResolvedValue(undefined);
        const useCase = new UpdateRoleUseCase(roleRepository);
        return { useCase, roleRepository };
    };

    it("should update a role successfully", async () => {
        const { useCase, roleRepository } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(roleRepository.get).toHaveBeenCalledWith("role-id");
        expect(roleRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: "role-id" });
    });

    it("should update only default display name", async () => {
        const { useCase, roleRepository } = makeSut();
        await useCase.execute({ id: "role-id", defaultDisplayName: "Owner" });
        expect(roleRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should update only description", async () => {
        const { useCase, roleRepository } = makeSut();
        await useCase.execute({ id: "role-id", description: "Updated description." });
        expect(roleRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should throw RoleNotFoundError when role does not exist", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.get.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(RoleNotFoundError);
        expect(roleRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
