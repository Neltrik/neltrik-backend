import type { IdGenerator } from "@/shared/id-generator";

import { AuthenticationAccountAlreadyExistsError } from "../../../../domain/errors";
import { Password, PasswordHash } from "../../../../domain/value-objects";
import { AuthenticationAccountRepositorySpy, PasswordHasherSpy, UserApiSpy } from "../../../../test-doubles";
import { CreateAuthenticationAccountUseCase } from "./index";
import type { CreateAuthenticationAccountInput } from "./input";

const makeInput = (): CreateAuthenticationAccountInput => ({
    userId: "user-id",
    provider: "email-password",
    email: "foo@example.com",
    password: Password.create("a-secure-password"),
});

describe("CreateAuthenticationAccountUseCase", () => {
    const makeSut = () => {
        const userApi = new UserApiSpy();
        userApi.validateUserById.mockResolvedValue(undefined);
        userApi.validateEmail.mockResolvedValue(undefined);
        const authenticationAccountRepository = new AuthenticationAccountRepositorySpy();
        authenticationAccountRepository.create.mockResolvedValue(undefined);
        authenticationAccountRepository.findByUserId.mockResolvedValue(null);
        const passwordHasher = new PasswordHasherSpy();
        const passwordHash = PasswordHash.create("hashed-password");
        passwordHasher.hash.mockResolvedValue(passwordHash);
        const generateMock = jest.fn().mockReturnValue("authentication-account-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const useCase = new CreateAuthenticationAccountUseCase(
            userApi,
            idGenerator,
            authenticationAccountRepository,
            passwordHasher,
        );
        return { useCase, userApi, authenticationAccountRepository, passwordHasher, generateMock };
    };

    it("should create an authentication account successfully", async () => {
        const { useCase, userApi, authenticationAccountRepository, passwordHasher, generateMock } = makeSut();
        const input = makeInput();
        const result = await useCase.execute(input);
        expect(userApi.validateUserById).toHaveBeenCalledTimes(1);
        expect(userApi.validateUserById).toHaveBeenCalledWith("user-id");
        expect(userApi.validateEmail).toHaveBeenCalledTimes(1);
        expect(userApi.validateEmail).toHaveBeenCalledWith("foo@example.com");
        expect(authenticationAccountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(authenticationAccountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(passwordHasher.hash).toHaveBeenCalledWith(input.password);
        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(authenticationAccountRepository.create).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: "authentication-account-id" });
    });

    it("should create an authentication account with email unverified", async () => {
        const { useCase, authenticationAccountRepository } = makeSut();
        await useCase.execute(makeInput());
        expect(authenticationAccountRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({ emailVerified: false }),
        );
    });

    it("should use the generated password hash", async () => {
        const { useCase, authenticationAccountRepository, passwordHasher } = makeSut();
        const input = makeInput();
        await useCase.execute(input);
        const account = authenticationAccountRepository.create.mock.calls[0]?.[0];
        expect(account).toBeDefined();
        expect(passwordHasher.hash).toHaveBeenCalledWith(input.password);
        expect(account?.passwordHash.value).toBe("hashed-password");
    });

    it("should throw AuthenticationAccountAlreadyExistsError when the user already has an account", async () => {
        const { useCase, authenticationAccountRepository, passwordHasher } = makeSut();
        authenticationAccountRepository.findByUserId.mockResolvedValue({} as never);
        await expect(useCase.execute(makeInput())).rejects.toThrow(AuthenticationAccountAlreadyExistsError);
        expect(authenticationAccountRepository.create).not.toHaveBeenCalled();
        expect(passwordHasher.hash).not.toHaveBeenCalled();
    });

    it("should propagate user validation errors", async () => {
        const { useCase, userApi, authenticationAccountRepository } = makeSut();
        userApi.validateUserById.mockRejectedValue(new Error("User not found"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("User not found");
        expect(userApi.validateEmail).not.toHaveBeenCalled();
        expect(authenticationAccountRepository.findByUserId).not.toHaveBeenCalled();
        expect(authenticationAccountRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate email validation errors", async () => {
        const { useCase, userApi, authenticationAccountRepository } = makeSut();
        userApi.validateEmail.mockRejectedValue(new Error("Email not found"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Email not found");
        expect(authenticationAccountRepository.findByUserId).not.toHaveBeenCalled();
        expect(authenticationAccountRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate password hasher errors", async () => {
        const { useCase, authenticationAccountRepository, passwordHasher } = makeSut();
        passwordHasher.hash.mockRejectedValue(new Error("Hashing error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Hashing error");
        expect(authenticationAccountRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, authenticationAccountRepository } = makeSut();
        authenticationAccountRepository.create.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
