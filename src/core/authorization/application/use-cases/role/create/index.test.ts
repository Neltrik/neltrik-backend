import type { IdGenerator } from "@/shared/id-generator";

import { CodeAlreadyExistsError } from "../../../../domain/errors";
import { RoleRepositorySpy } from "../../../../test-doubles";
import { CreateRoleUseCase } from "./index";
import type { CreateRoleInput } from "./input";

const makeInput = (): CreateRoleInput => ({
    code: "TENANT_ADMIN",
    defaultDisplayName: "Tenant Admin",
    description: "Administrator of a tenant.",
    scope: "PLATFORM",
});

describe("CreateRoleUseCase", () => {
    const makeSut = () => {
        const roleRepository = new RoleRepositorySpy();
        roleRepository.create.mockResolvedValue(undefined);
        roleRepository.existsByCode.mockResolvedValue(false);
        const generateMock = jest.fn().mockReturnValue("role-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const useCase = new CreateRoleUseCase(roleRepository, idGenerator);
        return { useCase, roleRepository, generateMock };
    };

    it("should create a role successfully", async () => {
        const { useCase, roleRepository, generateMock } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(roleRepository.existsByCode).toHaveBeenCalledWith("TENANT_ADMIN");
        expect(roleRepository.create).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: "role-id" });
    });

    it("should throw CodeAlreadyExistsError when code already exists", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.existsByCode.mockResolvedValue(true);
        await expect(useCase.execute(makeInput())).rejects.toThrow(CodeAlreadyExistsError);
        expect(roleRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.create.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
