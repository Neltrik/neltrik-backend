import type { IdGenerator } from "@/shared/id-generator";

import { EmailMismatchError } from "../../../../domain/errors";
import {
    AuthenticationAccountRepositorySpy,
    InvitationApiSpy,
    ProviderAuthenticationStrategyFactorySpy,
    UserApiSpy,
} from "../../../../test-doubles";
import { RegisterUseCase } from "./index";
import type { RegisterInput } from "./input";

const makeInput = (): RegisterInput => ({
    invitationToken: "invitation-token",
    provider: "email-password",
    firstName: "John",
    lastName: "Doe",
    email: "john@company.com",
    credentials: {
        email: "john@company.com",
        password: "Password123",
    },
});

describe("RegisterUseCase", () => {
    const makeSut = () => {
        const userApi = new UserApiSpy();
        userApi.create.mockResolvedValue({ id: "user-id" });
        userApi.delete.mockResolvedValue({ id: "user-id" });
        const invitationApi = new InvitationApiSpy();
        invitationApi.validate.mockResolvedValue({
            invitationId: "invitation-id",
            tenantId: "tenant-id",
            roleId: "role-id",
            recipient: "john@company.com",
        });
        invitationApi.consume.mockResolvedValue({ invitationId: "invitation-id" });
        const generateMock = jest.fn().mockReturnValue("account-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const accountRepository = new AuthenticationAccountRepositorySpy();
        accountRepository.create.mockResolvedValue(undefined);
        accountRepository.delete.mockResolvedValue(undefined);
        const strategyFactory = new ProviderAuthenticationStrategyFactorySpy();
        strategyFactory.strategy.register.mockResolvedValue({ passwordHash: "hashed-password" });
        const useCase = new RegisterUseCase(userApi, invitationApi, idGenerator, accountRepository, strategyFactory);
        return { useCase, userApi, invitationApi, generateMock, accountRepository, strategyFactory };
    };

    it("should register successfully", async () => {
        const { useCase, userApi, invitationApi, generateMock, accountRepository, strategyFactory } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(invitationApi.validate).toHaveBeenCalledTimes(1);
        expect(invitationApi.validate).toHaveBeenCalledWith("invitation-token");
        expect(strategyFactory.create).toHaveBeenCalledTimes(1);
        expect(strategyFactory.create).toHaveBeenCalledWith("email-password");
        expect(userApi.create).toHaveBeenCalledTimes(1);
        expect(userApi.create).toHaveBeenCalledWith({
            tenantId: "tenant-id",
            roleId: "role-id",
            email: "john@company.com",
            firstName: "John",
            lastName: "Doe",
        });
        expect(strategyFactory.strategy.register).toHaveBeenCalledTimes(1);
        expect(strategyFactory.strategy.register).toHaveBeenCalledWith({
            email: "john@company.com",
            password: "Password123",
        });
        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(accountRepository.create).toHaveBeenCalledTimes(1);
        expect(invitationApi.consume).toHaveBeenCalledTimes(1);
        expect(invitationApi.consume).toHaveBeenCalledWith("invitation-token");
        expect(result).toEqual({ accountId: "account-id" });
    });

    it("should throw EmailMismatchError when invitation recipient does not match input email", async () => {
        const { useCase, invitationApi, userApi, strategyFactory } = makeSut();
        invitationApi.validate.mockResolvedValue({
            invitationId: "invitation-id",
            tenantId: "tenant-id",
            roleId: "role-id",
            recipient: "another@company.com",
        });
        await expect(useCase.execute(makeInput())).rejects.toThrow(EmailMismatchError);
        expect(invitationApi.validate).toHaveBeenCalledTimes(1);
        expect(strategyFactory.create).not.toHaveBeenCalled();
        expect(userApi.create).not.toHaveBeenCalled();
    });

    it("should propagate invitation validation errors", async () => {
        const { useCase, invitationApi, userApi } = makeSut();
        invitationApi.validate.mockRejectedValue(new Error("Invitation not found"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Invitation not found");
        expect(invitationApi.validate).toHaveBeenCalledTimes(1);
        expect(userApi.create).not.toHaveBeenCalled();
    });

    it("should propagate strategy factory errors", async () => {
        const { useCase, strategyFactory, userApi } = makeSut();
        strategyFactory.create.mockImplementation(() => {
            throw new Error("Unsupported provider");
        });
        await expect(useCase.execute(makeInput())).rejects.toThrow("Unsupported provider");
        expect(strategyFactory.create).toHaveBeenCalledWith("email-password");
        expect(userApi.create).not.toHaveBeenCalled();
    });

    it("should propagate user creation errors", async () => {
        const { useCase, userApi, accountRepository } = makeSut();
        userApi.create.mockRejectedValue(new Error("User creation failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("User creation failed");
        expect(userApi.create).toHaveBeenCalledTimes(1);
        expect(accountRepository.create).not.toHaveBeenCalled();
    });

    it("should compensate the user when strategy registration fails", async () => {
        const { useCase, userApi, strategyFactory, accountRepository } = makeSut();
        strategyFactory.strategy.register.mockRejectedValue(new Error("Password registration failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Password registration failed");
        expect(userApi.create).toHaveBeenCalledTimes(1);
        expect(accountRepository.create).not.toHaveBeenCalled();
        expect(userApi.delete).toHaveBeenCalledTimes(1);
        expect(userApi.delete).toHaveBeenCalledWith("user-id");
    });

    it("should compensate the user when account creation fails", async () => {
        const { useCase, userApi, accountRepository } = makeSut();
        accountRepository.create.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(userApi.create).toHaveBeenCalledTimes(1);
        expect(accountRepository.create).toHaveBeenCalledTimes(1);
        expect(userApi.delete).toHaveBeenCalledTimes(1);
        expect(userApi.delete).toHaveBeenCalledWith("user-id");
        expect(accountRepository.delete).not.toHaveBeenCalled();
    });

    it("should compensate account and user when invitation consumption fails", async () => {
        const { useCase, userApi, invitationApi, accountRepository } = makeSut();
        invitationApi.consume.mockRejectedValue(new Error("Invitation consumption failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Invitation consumption failed");
        expect(accountRepository.delete).toHaveBeenCalledTimes(1);
        expect(accountRepository.delete).toHaveBeenCalledWith("account-id");
        expect(userApi.delete).toHaveBeenCalledTimes(1);
        expect(userApi.delete).toHaveBeenCalledWith("user-id");
    });

    it("should propagate invitation consumption errors", async () => {
        const { useCase, invitationApi } = makeSut();
        invitationApi.consume.mockRejectedValue(new Error("Invitation already consumed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Invitation already consumed");
    });

    it("should create an account without password hash when strategy returns null", async () => {
        const { useCase, strategyFactory, accountRepository } = makeSut();
        strategyFactory.strategy.register.mockResolvedValue({ passwordHash: null });
        await expect(useCase.execute(makeInput())).resolves.toEqual({ accountId: "account-id" });
        expect(accountRepository.create).toHaveBeenCalledTimes(1);
    });
});
