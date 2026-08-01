import type { IdGenerator } from "@/shared/id-generator";

import { EmailAlreadyExistsError } from "../../../domain/errors";
import { TenantApiSpy, UserRepositorySpy } from "../../../test-doubles";
import { RegisterUserUseCase } from "./index";
import type { RegisterUserInput } from "./input";

const makeInput = (): RegisterUserInput => ({
    id: "tenant-id",
    firstName: "John",
    lastName: "Doe",
    email: "john@company.com",
    tenantId: "tenant-id",
    roleId: "role-id",
});

describe("RegisterUserUseCase", () => {
    const makeSut = () => {
        const userRepository = new UserRepositorySpy();
        userRepository.create.mockResolvedValue(undefined);
        userRepository.existsByEmail.mockResolvedValue(false);
        const tenantApi = new TenantApiSpy();
        tenantApi.validate.mockResolvedValue(undefined);
        const generateMock = jest.fn().mockReturnValue("user-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const useCase = new RegisterUserUseCase(userRepository, tenantApi, idGenerator);
        return { useCase, userRepository, tenantApi, generateMock };
    };

    it("should register a user successfully", async () => {
        const { useCase, userRepository, tenantApi, generateMock } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(tenantApi.validate).toHaveBeenCalledWith("tenant-id");
        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(userRepository.existsByEmail).toHaveBeenCalledTimes(1);
        expect(userRepository.create).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: "user-id" });
    });

    it("should throw EmailAlreadyExistsError when email already exists", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.existsByEmail.mockResolvedValue(true);
        await expect(useCase.execute(makeInput())).rejects.toThrow(EmailAlreadyExistsError);
        expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate tenant validation errors", async () => {
        const { useCase, tenantApi } = makeSut();
        tenantApi.validate.mockRejectedValue(new Error("Tenant not found"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Tenant not found");
    });

    it("should propagate repository errors", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.create.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
