import type { IdGenerator } from "@/shared/id-generator";

import { Password, PasswordHash } from "../../../../domain/value-objects";
import { AuthorizationRoleApiSpy, TenantApiSpy } from "../../../../test-doubles";
import { AuthenticationAccountRepositorySpy, PasswordHasherSpy, UserApiSpy } from "../../../../test-doubles";
import { CreateAuthenticationAccountUseCase } from "./index";
import type { CreateAuthenticationAccountInput } from "./input";

const makeInput = (): CreateAuthenticationAccountInput => ({
    firstName: "John",
    lastName: "Doe",
    email: "foo@example.com",
    password: Password.create("a-secure-password"),
    provider: "email-password",
    tenantId: "tenant-id",
    roleId: "role-id",
});

describe("CreateAuthenticationAccountUseCase", () => {
    const makeSut = () => {
        const authorizationRoleApi = new AuthorizationRoleApiSpy();
        authorizationRoleApi.validate.mockResolvedValue(undefined);
        const tenantApi = new TenantApiSpy();
        tenantApi.validate.mockResolvedValue(undefined);
        const userApi = new UserApiSpy();
        userApi.create.mockResolvedValue({ id: "user-id" });
        const authenticationAccountRepository = new AuthenticationAccountRepositorySpy();
        authenticationAccountRepository.create.mockResolvedValue(undefined);
        const passwordHasher = new PasswordHasherSpy();
        const passwordHash = PasswordHash.create("hashed-password");
        passwordHasher.hash.mockResolvedValue(passwordHash);
        const generateMock = jest.fn().mockReturnValue("authentication-account-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const useCase = new CreateAuthenticationAccountUseCase(
            authorizationRoleApi,
            userApi,
            tenantApi,
            idGenerator,
            authenticationAccountRepository,
            passwordHasher,
        );
        return {
            useCase,
            authorizationRoleApi,
            userApi,
            tenantApi,
            authenticationAccountRepository,
            passwordHasher,
            generateMock,
        };
    };

    it("should create an authentication account successfully", async () => {
        const {
            useCase,
            authorizationRoleApi,
            userApi,
            tenantApi,
            authenticationAccountRepository,
            passwordHasher,
            generateMock,
        } = makeSut();
        const input = makeInput();
        const result = await useCase.execute(input);
        expect(authorizationRoleApi.validate).toHaveBeenCalledTimes(1);
        expect(authorizationRoleApi.validate).toHaveBeenCalledWith("role-id");
        expect(tenantApi.validate).toHaveBeenCalledTimes(1);
        expect(tenantApi.validate).toHaveBeenCalledWith("tenant-id");
        expect(passwordHasher.hash).toHaveBeenCalledTimes(1);
        expect(passwordHasher.hash).toHaveBeenCalledWith(input.password);
        expect(userApi.create).toHaveBeenCalledTimes(1);
        expect(userApi.create).toHaveBeenCalledWith({
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            roleId: input.roleId,
            tenantId: input.tenantId,
        });
        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(authenticationAccountRepository.create).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: "authentication-account-id" });
    });

    it("should create an authentication account with the correct data", async () => {
        const { useCase, authenticationAccountRepository } = makeSut();
        const createMock = authenticationAccountRepository.create.mockImplementation((account) => {
            expect(account.id).toBe("authentication-account-id");
            expect(account.userId).toBe("user-id");
            expect(account.email).toBe("foo@example.com");
            expect(account.provider.value).toBe("email-password");
            expect(account.passwordHash.value).toBe("hashed-password");
            return Promise.resolve();
        });
        await useCase.execute(makeInput());
        expect(createMock).toHaveBeenCalledTimes(1);
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
        expect(passwordHasher.hash).toHaveBeenCalledWith(input.password);
        expect(account?.passwordHash.value).toBe("hashed-password");
    });

    it("should propagate role validation errors", async () => {
        const { useCase, authorizationRoleApi, tenantApi, userApi, passwordHasher, authenticationAccountRepository } =
            makeSut();
        authorizationRoleApi.validate.mockRejectedValue(new Error("Role not found"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Role not found");
        expect(tenantApi.validate).not.toHaveBeenCalled();
        expect(passwordHasher.hash).not.toHaveBeenCalled();
        expect(userApi.create).not.toHaveBeenCalled();
        expect(authenticationAccountRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate tenant validation errors", async () => {
        const { useCase, tenantApi, userApi, passwordHasher, authenticationAccountRepository } = makeSut();
        tenantApi.validate.mockRejectedValue(new Error("Tenant not found"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Tenant not found");
        expect(userApi.create).not.toHaveBeenCalled();
        expect(passwordHasher.hash).not.toHaveBeenCalled();
        expect(authenticationAccountRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate password hasher errors", async () => {
        const { useCase, passwordHasher, userApi, authenticationAccountRepository } = makeSut();
        passwordHasher.hash.mockRejectedValue(new Error("Hashing error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Hashing error");
        expect(userApi.create).not.toHaveBeenCalled();
        expect(authenticationAccountRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate user creation errors", async () => {
        const { useCase, userApi, authenticationAccountRepository } = makeSut();
        userApi.create.mockRejectedValue(new Error("User creation error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("User creation error");
        expect(authenticationAccountRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, authenticationAccountRepository } = makeSut();
        authenticationAccountRepository.create.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
