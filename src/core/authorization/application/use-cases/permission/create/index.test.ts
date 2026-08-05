import type { IdGenerator } from "@/shared/id-generator";

import { CodeAlreadyExistsError } from "../../../../domain/errors";
import { PermissionRepositorySpy } from "../../../../test-doubles";
import { CreatePermissionUseCase } from "./index";
import type { CreatePermissionInput } from "./input";

const makeInput = (): CreatePermissionInput => ({
    code: "USER_CREATE",
    description: "Allows creating users.",
});

describe("CreatePermissionUseCase", () => {
    const makeSut = () => {
        const permissionRepository = new PermissionRepositorySpy();
        permissionRepository.create.mockResolvedValue(undefined);
        permissionRepository.existsByCode.mockResolvedValue(false);
        const generateMock = jest.fn().mockReturnValue("permission-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const useCase = new CreatePermissionUseCase(permissionRepository, idGenerator);
        return { useCase, permissionRepository, generateMock };
    };

    it("should create a permission successfully", async () => {
        const { useCase, permissionRepository, generateMock } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(permissionRepository.existsByCode).toHaveBeenCalledTimes(1);
        expect(permissionRepository.existsByCode).toHaveBeenCalledWith("USER_CREATE");
        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(permissionRepository.create).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: "permission-id" });
    });

    it("should throw CodeAlreadyExistsError when code already exists", async () => {
        const { useCase, permissionRepository } = makeSut();
        permissionRepository.existsByCode.mockResolvedValue(true);
        await expect(useCase.execute(makeInput())).rejects.toThrow(CodeAlreadyExistsError);
        expect(permissionRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate repository create errors", async () => {
        const { useCase, permissionRepository } = makeSut();
        permissionRepository.create.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });

    it("should propagate repository existsByCode errors", async () => {
        const { useCase, permissionRepository } = makeSut();
        permissionRepository.existsByCode.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(permissionRepository.create).not.toHaveBeenCalled();
    });
});
