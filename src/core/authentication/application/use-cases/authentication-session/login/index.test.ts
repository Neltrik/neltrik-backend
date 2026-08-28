import type { IdGenerator } from "@/shared/id-generator";

import { AuthenticationAccount } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError, InvalidCredentialsError } from "../../../../domain/errors";
import { PasswordHash } from "../../../../domain/value-objects";
import {
    AuthenticationAccountRepositorySpy,
    AuthenticationSessionRepositorySpy,
    AuthorizationRoleApiSpy,
    ProviderAuthenticationStrategyFactorySpy,
    Sha256HasherSpy,
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

const accessTokenExpiration = new Date("2026-09-01T00:00:00.000Z");
const refreshTokenExpiration = new Date("2026-10-01T00:00:00.000Z");

describe("LoginUseCase", () => {
    const makeSut = () => {
        const authorizationRoleApi = new AuthorizationRoleApiSpy();
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
            email: "john@company.com",
            firstName: "John",
            lastName: "Doe",
            status: "ACTIVE",
            suspendedAt: null,
            updatedAt: new Date(),
        });
        const account = AuthenticationAccount.create({
            id: "account-id",
            userId: "user-id",
            email: "john@company.com",
            provider: "email-password",
            createdAt: new Date(),
            passwordHash: PasswordHash.create("hashed-password"),
            updatedAt: new Date(),
        });
        const accountRepository = new AuthenticationAccountRepositorySpy();
        accountRepository.findByEmail.mockResolvedValue(account);
        const sessionRepository = new AuthenticationSessionRepositorySpy();
        const strategyFactory = new ProviderAuthenticationStrategyFactorySpy();
        strategyFactory.strategy.authenticate.mockResolvedValue({
            email: "john@company.com",
        });
        const sha256Hasher = new Sha256HasherSpy();
        sha256Hasher.hash.mockReturnValue("refresh-token-hash");
        const tokenProvider = new TokenProviderSpy();
        tokenProvider.generateAccessToken.mockResolvedValue("access-token");
        tokenProvider.generateRefreshToken.mockReturnValue("refresh-token");
        tokenProvider.calculateAccessTokenExpiration.mockReturnValue(accessTokenExpiration);
        tokenProvider.calculateRefreshTokenExpiration.mockReturnValue(refreshTokenExpiration);
        const idGenerator = {
            generate: jest.fn().mockReturnValue("session-id"),
        } satisfies IdGenerator;
        const useCase = new LoginUseCase(
            authorizationRoleApi,
            userApi,
            idGenerator,
            accountRepository,
            sessionRepository,
            sha256Hasher,
            tokenProvider,
            strategyFactory,
        );
        return {
            useCase,
            accountRepository,
            sessionRepository,
            strategyFactory,
            authorizationRoleApi,
            userApi,
            idGenerator,
            sha256Hasher,
            tokenProvider,
        };
    };

    const expectNoAuthenticationFlow = (sut: ReturnType<typeof makeSut>) => {
        expect(sut.userApi.getUserById).not.toHaveBeenCalled();
        expect(sut.authorizationRoleApi.getRoleById).not.toHaveBeenCalled();
        expect(sut.tokenProvider.generateAccessToken).not.toHaveBeenCalled();
        expect(sut.sha256Hasher.hash).not.toHaveBeenCalled();
        expect(sut.sessionRepository.create).not.toHaveBeenCalled();
    };

    const expectNoSessionCreation = (sut: ReturnType<typeof makeSut>) => {
        expect(sut.sha256Hasher.hash).not.toHaveBeenCalled();
        expect(sut.sessionRepository.create).not.toHaveBeenCalled();
    };

    describe("execute", () => {
        it("should login successfully", async () => {
            const sut = makeSut();
            const result = await sut.useCase.execute(makeInput());
            expect(sut.accountRepository.findByEmail).toHaveBeenCalledWith("john@company.com");
            expect(sut.strategyFactory.create).toHaveBeenCalledWith("email-password");
            expect(sut.strategyFactory.strategy.authenticate).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "account-id",
                    userId: "user-id",
                    email: "john@company.com",
                    provider: "email-password",
                }),
                { password: "Password123" },
            );
            expect(sut.userApi.getUserById).toHaveBeenCalledWith("user-id");
            expect(sut.authorizationRoleApi.getRoleById).toHaveBeenCalledWith("role-id");
            expect(sut.tokenProvider.generateAccessToken).toHaveBeenCalledWith({
                userId: "user-id",
                email: "john@company.com",
                roleCode: "USER",
                tenantId: "tenant-id",
            });
            expect(sut.tokenProvider.generateRefreshToken).toHaveBeenCalledTimes(1);
            expect(sut.sha256Hasher.hash).toHaveBeenCalledWith("refresh-token");
            expect(sut.tokenProvider.calculateAccessTokenExpiration).toHaveBeenCalledTimes(1);
            expect(sut.tokenProvider.calculateRefreshTokenExpiration).toHaveBeenCalledTimes(1);
            expect(sut.idGenerator.generate).toHaveBeenCalledTimes(1);
            expect(sut.sessionRepository.create).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                sessionId: "session-id",
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });
        });

        it("should throw AuthenticationAccountNotFoundError when account does not exist", async () => {
            const sut = makeSut();
            sut.accountRepository.findByEmail.mockResolvedValue(null);
            await expect(sut.useCase.execute(makeInput())).rejects.toThrow(AuthenticationAccountNotFoundError);
            expect(sut.accountRepository.findByEmail).toHaveBeenCalledWith("john@company.com");
            expect(sut.strategyFactory.create).not.toHaveBeenCalled();
            expect(sut.strategyFactory.strategy.authenticate).not.toHaveBeenCalled();
            expectNoAuthenticationFlow(sut);
        });

        it("should throw InvalidCredentialsError when credentials are invalid", async () => {
            const sut = makeSut();
            sut.strategyFactory.strategy.authenticate.mockResolvedValue(null);
            await expect(sut.useCase.execute(makeInput())).rejects.toThrow(InvalidCredentialsError);
            expect(sut.strategyFactory.create).toHaveBeenCalledWith("email-password");
            expect(sut.strategyFactory.strategy.authenticate).toHaveBeenCalledTimes(1);
            expectNoAuthenticationFlow(sut);
        });

        it("should propagate account repository errors", async () => {
            const sut = makeSut();
            sut.accountRepository.findByEmail.mockRejectedValue(new Error("Database error"));
            await expect(sut.useCase.execute(makeInput())).rejects.toThrow("Database error");
            expect(sut.strategyFactory.create).not.toHaveBeenCalled();
        });

        it("should propagate strategy factory errors", async () => {
            const sut = makeSut();
            sut.strategyFactory.create.mockImplementation(() => {
                throw new Error("Unsupported provider");
            });
            await expect(sut.useCase.execute(makeInput())).rejects.toThrow("Unsupported provider");
            expect(sut.userApi.getUserById).not.toHaveBeenCalled();
            expect(sut.sessionRepository.create).not.toHaveBeenCalled();
        });

        it("should propagate strategy authentication errors", async () => {
            const sut = makeSut();
            sut.strategyFactory.strategy.authenticate.mockRejectedValue(new Error("Authentication provider failed"));
            await expect(sut.useCase.execute(makeInput())).rejects.toThrow("Authentication provider failed");
            expect(sut.userApi.getUserById).not.toHaveBeenCalled();
            expect(sut.sessionRepository.create).not.toHaveBeenCalled();
        });

        it("should propagate user lookup errors", async () => {
            const sut = makeSut();
            sut.userApi.getUserById.mockRejectedValue(new Error("User lookup failed"));
            await expect(sut.useCase.execute(makeInput())).rejects.toThrow("User lookup failed");
            expect(sut.authorizationRoleApi.getRoleById).not.toHaveBeenCalled();
            expectNoSessionCreation(sut);
        });

        it("should propagate role lookup errors", async () => {
            const sut = makeSut();
            sut.authorizationRoleApi.getRoleById.mockRejectedValue(new Error("Role lookup failed"));
            await expect(sut.useCase.execute(makeInput())).rejects.toThrow("Role lookup failed");
            expect(sut.tokenProvider.generateAccessToken).not.toHaveBeenCalled();
            expectNoSessionCreation(sut);
        });

        it("should propagate access token generation errors", async () => {
            const sut = makeSut();
            sut.tokenProvider.generateAccessToken.mockRejectedValue(new Error("Access token generation failed"));
            await expect(sut.useCase.execute(makeInput())).rejects.toThrow("Access token generation failed");
            expect(sut.tokenProvider.generateRefreshToken).not.toHaveBeenCalled();
            expectNoSessionCreation(sut);
        });

        it("should propagate refresh token generation errors", async () => {
            const sut = makeSut();
            sut.tokenProvider.generateRefreshToken.mockImplementation(() => {
                throw new Error("Refresh token generation failed");
            });
            await expect(sut.useCase.execute(makeInput())).rejects.toThrow("Refresh token generation failed");
            expectNoSessionCreation(sut);
        });

        it("should propagate refresh token hashing errors", async () => {
            const sut = makeSut();
            sut.sha256Hasher.hash.mockImplementation(() => {
                throw new Error("Refresh token hashing failed");
            });
            await expect(sut.useCase.execute(makeInput())).rejects.toThrow("Refresh token hashing failed");
            expect(sut.tokenProvider.generateRefreshToken).toHaveBeenCalledTimes(1);
            expect(sut.sha256Hasher.hash).toHaveBeenCalledWith("refresh-token");
            expect(sut.sessionRepository.create).not.toHaveBeenCalled();
        });

        it("should propagate access token expiration errors", async () => {
            const sut = makeSut();
            sut.tokenProvider.calculateAccessTokenExpiration.mockImplementation(() => {
                throw new Error("Access token expiration failed");
            });
            await expect(sut.useCase.execute(makeInput())).rejects.toThrow("Access token expiration failed");
            expect(sut.sessionRepository.create).not.toHaveBeenCalled();
        });

        it("should propagate refresh token expiration errors", async () => {
            const sut = makeSut();
            sut.tokenProvider.calculateRefreshTokenExpiration.mockImplementation(() => {
                throw new Error("Refresh token expiration failed");
            });
            await expect(sut.useCase.execute(makeInput())).rejects.toThrow("Refresh token expiration failed");
            expect(sut.sessionRepository.create).not.toHaveBeenCalled();
        });

        it("should propagate session creation errors", async () => {
            const sut = makeSut();
            sut.sessionRepository.create.mockRejectedValue(new Error("Session creation failed"));
            await expect(sut.useCase.execute(makeInput())).rejects.toThrow("Session creation failed");
            expect(sut.sessionRepository.create).toHaveBeenCalledTimes(1);
        });

        it("should use null for optional session metadata", async () => {
            const sut = makeSut();
            const input = makeInput();
            delete input.ipAddress;
            delete input.userAgent;
            await sut.useCase.execute(input);
            const [session] = sut.sessionRepository.create.mock.calls[0] ?? [];
            expect(session).toBeDefined();
            expect(session?.ipAddress).toBeNull();
            expect(session?.userAgent).toBeNull();
        });

        it("should create the session with the expected values", async () => {
            const sut = makeSut();
            await sut.useCase.execute(makeInput());
            const [session] = sut.sessionRepository.create.mock.calls[0] ?? [];
            expect(session).toBeDefined();
            expect(session?.id).toBe("session-id");
            expect(session?.authenticationAccountId).toBe("account-id");
            expect(session?.refreshTokenHash).toBe("refresh-token-hash");
            expect(session?.expiresAt.value).toEqual(accessTokenExpiration);
            expect(session?.refreshTokenExpiresAt.value).toEqual(refreshTokenExpiration);
            expect(session?.ipAddress).toBe("127.0.0.1");
            expect(session?.userAgent).toBe("Mozilla/5.0");
        });
    });
});
