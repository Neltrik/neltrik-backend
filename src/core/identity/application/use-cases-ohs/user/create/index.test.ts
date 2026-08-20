import type { IdGenerator } from "@/shared/id-generator";

import { EmailAlreadyExistsError } from "../../../../domain/errors";
import { UserRepositorySpy } from "../../../../test-doubles";
import { RegisterUserOhsUseCase } from "./index";
import type { RegisterUserOhsInput } from "./input";

const makeInput = (): RegisterUserOhsInput => ({
    firstName: "John",
    lastName: "Doe",
    email: "john@company.com",
    tenantId: "tenant-id",
    roleId: "role-id",
});

describe("RegisterUserOhsUseCase", () => {
    const makeSut = () => {
        const userRepository = new UserRepositorySpy();
        userRepository.create.mockResolvedValue(undefined);
        userRepository.existsByEmail.mockResolvedValue(false);
        const generateMock = jest.fn().mockReturnValue("user-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const useCase = new RegisterUserOhsUseCase(userRepository, idGenerator);
        return { useCase, userRepository, generateMock };
    };

    it("should register a user successfully", async () => {
        const { useCase, userRepository, generateMock } = makeSut();
        const result = await useCase.execute(makeInput());
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
        expect(userRepository.existsByEmail).toHaveBeenCalledTimes(1);
    });

    it("should propagate repository errors when checking email existence", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.existsByEmail.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when creating user", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.create.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(userRepository.create).toHaveBeenCalledTimes(1);
    });
});
