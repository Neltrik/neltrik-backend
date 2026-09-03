import { AuthenticationAccount, AuthenticationSession } from "../../../../domain/entities";
import {
    AuthenticationAccountNotFoundError,
    InvalidRefreshTokenError,
    SessionExpiredError,
    SessionRevokedError,
} from "../../../../domain/errors";
import { ExpirationDate, PasswordHash } from "../../../../domain/value-objects";
import {
    AuthenticationAccountRepositorySpy,
    AuthenticationSessionRepositorySpy,
    AuthorizationRoleApiSpy,
    Sha256HasherSpy,
    TokenProviderSpy,
    UserApiSpy,
} from "../../../../test-doubles";
import { RefreshTokenUseCase } from "./index";

describe("RefreshTokenUseCase", () => {
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
        accountRepository.findById.mockResolvedValue(account);
        const sessionRepository = new AuthenticationSessionRepositorySpy();
        const sha256Hasher = new Sha256HasherSpy();
        sha256Hasher.hash.mockReturnValueOnce("refresh-token-hash").mockReturnValueOnce("new-refresh-token-hash");
        const tokenProvider = new TokenProviderSpy();
        tokenProvider.generateAccessToken.mockResolvedValue("access-token");
        tokenProvider.generateRefreshToken.mockReturnValue("new-refresh-token");
        const now = Date.now();
        const sessionExpiresAt = new Date(now + 24 * 60 * 60 * 1000);
        const refreshTokenExpiresAt = new Date(now + 30 * 24 * 60 * 60 * 1000);
        const newRefreshTokenExpiration = new Date(now + 60 * 24 * 60 * 60 * 1000);
        tokenProvider.calculateRefreshTokenExpiration.mockReturnValue(newRefreshTokenExpiration);
        const session = AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "account-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(sessionExpiresAt),
            refreshTokenExpiresAt: ExpirationDate.create(refreshTokenExpiresAt),
            ipAddress: "127.0.0.1",
            userAgent: "Mozilla/5.0",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        sessionRepository.findByRefreshTokenHash.mockResolvedValue(session);
        sessionRepository.update.mockResolvedValue(undefined);
        const useCase = new RefreshTokenUseCase(
            authorizationRoleApi,
            userApi,
            accountRepository,
            sessionRepository,
            sha256Hasher,
            tokenProvider,
        );
        return {
            useCase,
            authorizationRoleApi,
            userApi,
            accountRepository,
            sessionRepository,
            sha256Hasher,
            tokenProvider,
            session,
            sessionExpiresAt,
            newRefreshTokenExpiration,
        };
    };

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should refresh the token successfully", async () => {
        const { useCase, sha256Hasher, tokenProvider, sessionRepository } = makeSut();
        const result = await useCase.execute("refresh-token");
        expect(sha256Hasher.hash).toHaveBeenNthCalledWith(1, "refresh-token");
        expect(sha256Hasher.hash).toHaveBeenNthCalledWith(2, "new-refresh-token");
        expect(sessionRepository.findByRefreshTokenHash).toHaveBeenCalledWith("refresh-token-hash");
        expect(tokenProvider.generateAccessToken).toHaveBeenCalledWith({
            userId: "user-id",
            email: "john@company.com",
            tenantId: "tenant-id",
            roleCode: "USER",
            emailVerified: false,
        });
        expect(tokenProvider.generateRefreshToken).toHaveBeenCalledTimes(1);
        expect(tokenProvider.calculateRefreshTokenExpiration).toHaveBeenCalledTimes(1);
        expect(sessionRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ accessToken: "access-token", refreshToken: "new-refresh-token" });
    });

    it("should throw InvalidRefreshTokenError when refresh token is not provided", async () => {
        const { useCase, sha256Hasher, sessionRepository } = makeSut();
        await expect(useCase.execute(undefined)).rejects.toThrow(InvalidRefreshTokenError);
        expect(sha256Hasher.hash).not.toHaveBeenCalled();
        expect(sessionRepository.findByRefreshTokenHash).not.toHaveBeenCalled();
    });

    it("should throw InvalidRefreshTokenError when session does not exist", async () => {
        const { useCase, sessionRepository, accountRepository } = makeSut();
        sessionRepository.findByRefreshTokenHash.mockResolvedValue(null);
        await expect(useCase.execute("refresh-token")).rejects.toThrow(InvalidRefreshTokenError);
        expect(accountRepository.findById).not.toHaveBeenCalled();
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should throw SessionExpiredError when session is expired", async () => {
        jest.useFakeTimers();
        const now = new Date("2026-08-28T12:00:00.000Z");
        jest.setSystemTime(now);
        const { useCase, sessionRepository, accountRepository } = makeSut();
        jest.setSystemTime(new Date("2026-08-29T12:00:00.000Z"));
        await expect(useCase.execute("refresh-token")).rejects.toThrow(SessionExpiredError);
        expect(accountRepository.findById).not.toHaveBeenCalled();
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should throw SessionRevokedError when session is revoked", async () => {
        const { useCase, sessionRepository, accountRepository } = makeSut();
        const revokedSession = AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "account-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(new Date("2099-01-01")),
            refreshTokenExpiresAt: ExpirationDate.create(new Date("2099-01-01")),
            ipAddress: null,
            userAgent: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        revokedSession.revoke();
        sessionRepository.findByRefreshTokenHash.mockResolvedValue(revokedSession);
        await expect(useCase.execute("refresh-token")).rejects.toThrow(SessionRevokedError);
        expect(accountRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw InvalidRefreshTokenError when refresh token is expired", async () => {
        jest.useFakeTimers();
        const now = new Date("2026-08-28T12:00:00.000Z");
        jest.setSystemTime(now);
        const { useCase, sessionRepository, accountRepository } = makeSut();
        const sessionWithExpiredRefreshToken = AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "account-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(new Date(now.getTime() + 2 * 60 * 60 * 1000)),
            refreshTokenExpiresAt: ExpirationDate.create(new Date(now.getTime() + 30 * 60 * 1000)),
            ipAddress: null,
            userAgent: null,
            createdAt: now,
            updatedAt: now,
        });
        sessionRepository.findByRefreshTokenHash.mockResolvedValue(sessionWithExpiredRefreshToken);
        jest.setSystemTime(new Date(now.getTime() + 60 * 60 * 1000));
        await expect(useCase.execute("refresh-token")).rejects.toThrow(InvalidRefreshTokenError);
        expect(accountRepository.findById).not.toHaveBeenCalled();
        expect(accountRepository.findById).not.toHaveBeenCalled();
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should throw AuthenticationAccountNotFoundError when account does not exist", async () => {
        const { useCase, accountRepository, userApi, authorizationRoleApi, tokenProvider, sessionRepository } =
            makeSut();
        accountRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute("refresh-token")).rejects.toThrow(AuthenticationAccountNotFoundError);
        expect(accountRepository.findById).toHaveBeenCalledWith("account-id");
        expect(userApi.getUserById).not.toHaveBeenCalled();
        expect(authorizationRoleApi.getRoleById).not.toHaveBeenCalled();
        expect(tokenProvider.generateAccessToken).not.toHaveBeenCalled();
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate refresh token hashing errors", async () => {
        const { useCase, sha256Hasher, sessionRepository } = makeSut();
        sha256Hasher.hash.mockReset();
        sha256Hasher.hash.mockImplementation(() => {
            throw new Error("Hashing failed");
        });
        await expect(useCase.execute("refresh-token")).rejects.toThrow("Hashing failed");
        expect(sessionRepository.findByRefreshTokenHash).not.toHaveBeenCalled();
    });

    it("should propagate session lookup errors", async () => {
        const { useCase, sessionRepository, accountRepository } = makeSut();
        sessionRepository.findByRefreshTokenHash.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("refresh-token")).rejects.toThrow("Database error");
        expect(accountRepository.findById).not.toHaveBeenCalled();
    });

    it("should propagate account lookup errors", async () => {
        const { useCase, accountRepository, userApi } = makeSut();
        accountRepository.findById.mockRejectedValue(new Error("Account lookup failed"));
        await expect(useCase.execute("refresh-token")).rejects.toThrow("Account lookup failed");
        expect(userApi.getUserById).not.toHaveBeenCalled();
    });

    it("should propagate user lookup errors", async () => {
        const { useCase, userApi, authorizationRoleApi } = makeSut();
        userApi.getUserById.mockRejectedValue(new Error("User lookup failed"));
        await expect(useCase.execute("refresh-token")).rejects.toThrow("User lookup failed");
        expect(authorizationRoleApi.getRoleById).not.toHaveBeenCalled();
    });

    it("should propagate role lookup errors", async () => {
        const { useCase, authorizationRoleApi, tokenProvider } = makeSut();
        authorizationRoleApi.getRoleById.mockRejectedValue(new Error("Role lookup failed"));
        await expect(useCase.execute("refresh-token")).rejects.toThrow("Role lookup failed");
        expect(tokenProvider.generateAccessToken).not.toHaveBeenCalled();
    });

    it("should propagate access token generation errors", async () => {
        const { useCase, tokenProvider, sessionRepository } = makeSut();
        tokenProvider.generateAccessToken.mockRejectedValue(new Error("Access token generation failed"));
        await expect(useCase.execute("refresh-token")).rejects.toThrow("Access token generation failed");
        expect(tokenProvider.generateRefreshToken).not.toHaveBeenCalled();
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate new refresh token hashing errors", async () => {
        const { useCase, sha256Hasher, sessionRepository } = makeSut();
        sha256Hasher.hash
            .mockReset()
            .mockReturnValueOnce("refresh-token-hash")
            .mockImplementationOnce(() => {
                throw new Error("New refresh token hashing failed");
            });
        await expect(useCase.execute("refresh-token")).rejects.toThrow("New refresh token hashing failed");
        expect(sha256Hasher.hash).toHaveBeenNthCalledWith(1, "refresh-token");
        expect(sha256Hasher.hash).toHaveBeenNthCalledWith(2, "new-refresh-token");
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate session update errors", async () => {
        const { useCase, sessionRepository } = makeSut();
        sessionRepository.update.mockRejectedValue(new Error("Session update failed"));
        await expect(useCase.execute("refresh-token")).rejects.toThrow("Session update failed");
    });

    it("should rotate the refresh token", async () => {
        const { useCase, sessionRepository } = makeSut();
        await useCase.execute("refresh-token");
        const updatedSession = sessionRepository.update.mock.calls[0]?.[0];
        expect(updatedSession).toBeDefined();
        expect(updatedSession?.refreshTokenHash).toBe("new-refresh-token-hash");
    });

    it("should preserve the session expiration", async () => {
        const { useCase, sessionRepository, sessionExpiresAt } = makeSut();
        await useCase.execute("refresh-token");
        const updatedSession = sessionRepository.update.mock.calls[0]?.[0];
        expect(updatedSession).toBeDefined();
        expect(updatedSession?.expiresAt.value).toEqual(sessionExpiresAt);
    });

    it("should update the refresh token expiration", async () => {
        const { useCase, sessionRepository, newRefreshTokenExpiration } = makeSut();
        await useCase.execute("refresh-token");
        const updatedSession = sessionRepository.update.mock.calls[0]?.[0];
        expect(updatedSession).toBeDefined();
        expect(updatedSession?.refreshTokenExpiresAt.value).toEqual(newRefreshTokenExpiration);
    });
});
