import type { IdGenerator } from "@/shared/id-generator";

import { AuthenticationAccount } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError, InvalidCredentialsError } from "../../../../domain/errors";
import { PasswordHash } from "../../../../domain/value-objects";
import {
    AuthenticationAccountRepositorySpy,
    AuthenticationSessionRepositorySpy,
    AuthorizationRoleApiSpy,
    ProviderAuthenticationStrategyFactorySpy,
    TokenProviderSpy,
    UserApiSpy,
} from "../../../../test-doubles";
import { LoginUseCase } from "./index";
import type { LoginInput } from "./input";

const makeInput = (): LoginInput => ({
    email: "john@company.com",
    password: "Password123",
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0",
});

describe("LoginUseCase", () => {
    const makeSut = () => {
        const authorizationRoleApi = new AuthorizationRoleApiSpy();
        const account = AuthenticationAccount.create({
            id: "account-id",
            userId: "user-id",
            email: "john@company.com",
            provider: "email-password",
            createdAt: new Date(),
            passwordHash: PasswordHash.create("hashed-password"),
            updatedAt: new Date(),
        });
        authorizationRoleApi.getRoleById.mockResolvedValue({
            id: "role-id",
            code: "USER",
            scope: "PLATFORM",
        });
        const userApi = new UserApiSpy();
        userApi.getUserById.mockResolvedValue({
            id: "user-id",
            roleId: "role-id",
            tenantId: "tenant-id",
            createdAt: new Date(),
            email: "ov1356272@gmail.com",
            firstName: "juan",
            lastName: "pepito",
            status: "ACTIVE",
            suspendedAt: null,
            updatedAt: new Date(),
        });
        const generateMock = jest.fn().mockReturnValue("session-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const accountRepository = new AuthenticationAccountRepositorySpy();
        accountRepository.findByEmail.mockResolvedValue(account);
        const sessionRepository = new AuthenticationSessionRepositorySpy();
        sessionRepository.create.mockResolvedValue(undefined);
        const strategyFactory = new ProviderAuthenticationStrategyFactorySpy();
        strategyFactory.strategy.authenticate.mockResolvedValue({
            email: "john@company.com",
        });
        const tokenProvider = new TokenProviderSpy();
        tokenProvider.generateAccessToken.mockResolvedValue("access-token");
        tokenProvider.generateRefreshToken.mockReturnValue("refresh-token");
        tokenProvider.hashRefreshToken.mockResolvedValue("refresh-token-hash");
        const accessTokenExpiration = new Date("2026-09-01T00:00:00.000Z");
        const refreshTokenExpiration = new Date("2026-10-01T00:00:00.000Z");
        tokenProvider.calculateAccessTokenExpiration.mockReturnValue(accessTokenExpiration);
        tokenProvider.calculateRefreshTokenExpiration.mockReturnValue(refreshTokenExpiration);
        const useCase = new LoginUseCase(
            authorizationRoleApi,
            userApi,
            idGenerator,
            accountRepository,
            sessionRepository,
            strategyFactory,
            tokenProvider,
        );
        return {
            useCase,
            authorizationRoleApi,
            userApi,
            generateMock,
            accountRepository,
            sessionRepository,
            strategyFactory,
            tokenProvider,
            accessTokenExpiration,
            refreshTokenExpiration,
        };
    };

    it("should login successfully", async () => {
        const {
            useCase,
            accountRepository,
            strategyFactory,
            userApi,
            authorizationRoleApi,
            tokenProvider,
            generateMock,
            sessionRepository,
        } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(accountRepository.findByEmail).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByEmail).toHaveBeenCalledWith("john@company.com");
        expect(strategyFactory.create).toHaveBeenCalledTimes(1);
        expect(strategyFactory.create).toHaveBeenCalledWith("email-password");
        expect(strategyFactory.strategy.authenticate).toHaveBeenCalledTimes(1);
        expect(strategyFactory.strategy.authenticate).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "account-id",
                userId: "user-id",
                email: "john@company.com",
                provider: "email-password",
            }),
            { password: "Password123" },
        );
        expect(userApi.getUserById).toHaveBeenCalledTimes(1);
        expect(userApi.getUserById).toHaveBeenCalledWith("user-id");
        expect(authorizationRoleApi.getRoleById).toHaveBeenCalledTimes(1);
        expect(authorizationRoleApi.getRoleById).toHaveBeenCalledWith("role-id");
        expect(tokenProvider.generateAccessToken).toHaveBeenCalledTimes(1);
        expect(tokenProvider.generateAccessToken).toHaveBeenCalledWith({
            userId: "user-id",
            email: "john@company.com",
            roleCode: "USER",
            tenantId: "tenant-id",
        });
        expect(tokenProvider.generateRefreshToken).toHaveBeenCalledTimes(1);
        expect(tokenProvider.hashRefreshToken).toHaveBeenCalledTimes(1);
        expect(tokenProvider.hashRefreshToken).toHaveBeenCalledWith("refresh-token");
        expect(tokenProvider.calculateRefreshTokenExpiration).toHaveBeenCalledTimes(1);
        expect(tokenProvider.calculateAccessTokenExpiration).toHaveBeenCalledTimes(1);
        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(sessionRepository.create).toHaveBeenCalledTimes(1);
        expect(sessionRepository.create).toHaveBeenCalledWith(expect.anything());
        expect(result).toEqual({
            sessionId: "session-id",
            accessToken: "access-token",
            refreshToken: "refresh-token",
        });
    });

    it("should throw AuthenticationAccountNotFoundError when account does not exist", async () => {
        const {
            useCase,
            accountRepository,
            strategyFactory,
            userApi,
            authorizationRoleApi,
            tokenProvider,
            sessionRepository,
        } = makeSut();
        accountRepository.findByEmail.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(AuthenticationAccountNotFoundError);
        expect(accountRepository.findByEmail).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByEmail).toHaveBeenCalledWith("john@company.com");
        expect(strategyFactory.create).not.toHaveBeenCalled();
        expect(strategyFactory.strategy.authenticate).not.toHaveBeenCalled();
        expect(userApi.getUserById).not.toHaveBeenCalled();
        expect(authorizationRoleApi.getRoleById).not.toHaveBeenCalled();
        expect(tokenProvider.generateAccessToken).not.toHaveBeenCalled();
        expect(sessionRepository.create).not.toHaveBeenCalled();
    });

    it("should throw InvalidCredentialsError when credentials are invalid", async () => {
        const { useCase, strategyFactory, userApi, authorizationRoleApi, tokenProvider, sessionRepository } = makeSut();
        strategyFactory.strategy.authenticate.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(InvalidCredentialsError);
        expect(strategyFactory.create).toHaveBeenCalledTimes(1);
        expect(strategyFactory.create).toHaveBeenCalledWith("email-password");
        expect(strategyFactory.strategy.authenticate).toHaveBeenCalledTimes(1);
        expect(userApi.getUserById).not.toHaveBeenCalled();
        expect(authorizationRoleApi.getRoleById).not.toHaveBeenCalled();
        expect(tokenProvider.generateAccessToken).not.toHaveBeenCalled();
        expect(sessionRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate account repository errors", async () => {
        const { useCase, accountRepository, strategyFactory } = makeSut();
        accountRepository.findByEmail.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(accountRepository.findByEmail).toHaveBeenCalledTimes(1);
        expect(strategyFactory.create).not.toHaveBeenCalled();
    });

    it("should propagate strategy factory errors", async () => {
        const { useCase, strategyFactory, userApi, sessionRepository } = makeSut();
        strategyFactory.create.mockImplementation(() => {
            throw new Error("Unsupported provider");
        });
        await expect(useCase.execute(makeInput())).rejects.toThrow("Unsupported provider");
        expect(strategyFactory.create).toHaveBeenCalledTimes(1);
        expect(strategyFactory.create).toHaveBeenCalledWith("email-password");
        expect(userApi.getUserById).not.toHaveBeenCalled();
        expect(sessionRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate strategy authentication errors", async () => {
        const { useCase, strategyFactory, userApi, sessionRepository } = makeSut();
        strategyFactory.strategy.authenticate.mockRejectedValue(new Error("Authentication provider failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Authentication provider failed");
        expect(strategyFactory.strategy.authenticate).toHaveBeenCalledTimes(1);
        expect(userApi.getUserById).not.toHaveBeenCalled();
        expect(sessionRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate user lookup errors", async () => {
        const { useCase, userApi, authorizationRoleApi, tokenProvider, sessionRepository } = makeSut();
        userApi.getUserById.mockRejectedValue(new Error("User lookup failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("User lookup failed");
        expect(userApi.getUserById).toHaveBeenCalledWith("user-id");
        expect(authorizationRoleApi.getRoleById).not.toHaveBeenCalled();
        expect(tokenProvider.generateAccessToken).not.toHaveBeenCalled();
        expect(sessionRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate role lookup errors", async () => {
        const { useCase, authorizationRoleApi, tokenProvider, sessionRepository } = makeSut();
        authorizationRoleApi.getRoleById.mockRejectedValue(new Error("Role lookup failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Role lookup failed");
        expect(authorizationRoleApi.getRoleById).toHaveBeenCalledWith("role-id");
        expect(tokenProvider.generateAccessToken).not.toHaveBeenCalled();
        expect(sessionRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate access token generation errors", async () => {
        const { useCase, tokenProvider, sessionRepository } = makeSut();
        tokenProvider.generateAccessToken.mockRejectedValue(new Error("Access token generation failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Access token generation failed");
        expect(tokenProvider.generateAccessToken).toHaveBeenCalledTimes(1);
        expect(tokenProvider.generateRefreshToken).not.toHaveBeenCalled();
        expect(sessionRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate refresh token hashing errors", async () => {
        const { useCase, tokenProvider, sessionRepository } = makeSut();
        tokenProvider.hashRefreshToken.mockRejectedValue(new Error("Refresh token hashing failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Refresh token hashing failed");
        expect(tokenProvider.generateRefreshToken).toHaveBeenCalledTimes(1);
        expect(tokenProvider.hashRefreshToken).toHaveBeenCalledWith("refresh-token");
        expect(sessionRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate session creation errors", async () => {
        const { useCase, sessionRepository } = makeSut();
        sessionRepository.create.mockRejectedValue(new Error("Session creation failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Session creation failed");
        expect(sessionRepository.create).toHaveBeenCalledTimes(1);
    });

    it("should use null for ipAddress and userAgent when they are not provided", async () => {
        const { useCase, sessionRepository } = makeSut();
        const input = makeInput();
        delete input.ipAddress;
        delete input.userAgent;
        await useCase.execute(input);
        expect(sessionRepository.create).toHaveBeenCalledTimes(1);
        const session = sessionRepository.create.mock.calls[0]?.[0];
        expect(session).toBeDefined();
        expect(session?.ipAddress).toBeNull();
        expect(session?.userAgent).toBeNull();
    });

    it("should create the session with the generated tokens and expiration dates", async () => {
        const { useCase, sessionRepository, accessTokenExpiration, refreshTokenExpiration } = makeSut();
        await useCase.execute(makeInput());
        expect(sessionRepository.create).toHaveBeenCalledTimes(1);
        const session = sessionRepository.create.mock.calls[0]![0];
        expect(session.id).toBe("session-id");
        expect(session.authenticationAccountId).toBe("account-id");
        expect(session.refreshTokenHash).toBe("refresh-token-hash");
        expect(session.expiresAt.value).toEqual(accessTokenExpiration);
        expect(session.refreshTokenExpiresAt.value).toEqual(refreshTokenExpiration);
        expect(session.ipAddress).toBe("127.0.0.1");
        expect(session.userAgent).toBe("Mozilla/5.0");
    });
});
