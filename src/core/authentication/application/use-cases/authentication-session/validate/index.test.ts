import { AuthenticationAccount, AuthenticationSession } from "../../../../domain/entities";
import {
    AuthenticationAccountNotFoundError,
    SessionExpiredError,
    SessionNotFoundError,
    SessionRevokedError,
} from "../../../../domain/errors";
import { ExpirationDate, PasswordHash } from "../../../../domain/value-objects";
import {
    AuthenticationAccountRepositorySpy,
    AuthenticationSessionRepositorySpy,
    AuthorizationRoleApiSpy,
    UserApiSpy,
} from "../../../../test-doubles";
import { ValidateSessionUseCase } from "./index";

describe("ValidateSessionUseCase", () => {
    const makeSut = () => {
        const authorizationRoleApi = new AuthorizationRoleApiSpy();
        authorizationRoleApi.getRoleById.mockResolvedValue({ id: "role-id", code: "USER", scope: "PLATFORM" });
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
        const session = AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "account-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(new Date(Date.now() + 60 * 60 * 1000)),
            refreshTokenExpiresAt: ExpirationDate.create(new Date(Date.now() + 2 * 60 * 60 * 1000)),
            ipAddress: "127.0.0.1",
            userAgent: "Mozilla/5.0",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        sessionRepository.findById.mockResolvedValue(session);
        const useCase = new ValidateSessionUseCase(authorizationRoleApi, userApi, accountRepository, sessionRepository);
        return { useCase, authorizationRoleApi, userApi, accountRepository, sessionRepository, session, account };
    };

    it("should validate an active session successfully", async () => {
        const { useCase, sessionRepository, accountRepository, userApi, authorizationRoleApi } = makeSut();
        const result = await useCase.execute("session-id");
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
        expect(accountRepository.findById).toHaveBeenCalledTimes(1);
        expect(accountRepository.findById).toHaveBeenCalledWith("account-id");
        expect(userApi.getUserById).toHaveBeenCalledTimes(1);
        expect(userApi.getUserById).toHaveBeenCalledWith("user-id");
        expect(authorizationRoleApi.getRoleById).toHaveBeenCalledTimes(1);
        expect(authorizationRoleApi.getRoleById).toHaveBeenCalledWith("role-id");
        expect(result).toEqual({
            authenticationAccountId: "account-id",
            userId: "user-id",
            email: "john@company.com",
            tenantId: "tenant-id",
            roleCode: "USER",
        });
    });

    it("should throw SessionNotFoundError when session does not exist", async () => {
        const { useCase, sessionRepository, accountRepository, userApi, authorizationRoleApi } = makeSut();
        sessionRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute("invalid-session-id")).rejects.toThrow(SessionNotFoundError);
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("invalid-session-id");
        expect(accountRepository.findById).not.toHaveBeenCalled();
        expect(userApi.getUserById).not.toHaveBeenCalled();
        expect(authorizationRoleApi.getRoleById).not.toHaveBeenCalled();
    });

    it("should throw SessionExpiredError when session is expired", async () => {
        const { useCase, sessionRepository, accountRepository, userApi, authorizationRoleApi } = makeSut();
        const expiredSession = AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "account-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(new Date(Date.now() + 1000)),
            refreshTokenExpiresAt: ExpirationDate.create(new Date(Date.now() + 60 * 60 * 1000)),
            ipAddress: null,
            userAgent: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        jest.spyOn(expiredSession, "isExpired").mockReturnValue(true);
        sessionRepository.findById.mockResolvedValue(expiredSession);
        await expect(useCase.execute("session-id")).rejects.toThrow(SessionExpiredError);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
        expect(accountRepository.findById).not.toHaveBeenCalled();
        expect(userApi.getUserById).not.toHaveBeenCalled();
        expect(authorizationRoleApi.getRoleById).not.toHaveBeenCalled();
    });

    it("should throw SessionRevokedError when session is revoked", async () => {
        const { useCase, sessionRepository, accountRepository, userApi, authorizationRoleApi } = makeSut();
        const revokedSession = AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "account-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(new Date(Date.now() + 60 * 60 * 1000)),
            refreshTokenExpiresAt: ExpirationDate.create(new Date(Date.now() + 2 * 60 * 60 * 1000)),
            ipAddress: null,
            userAgent: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        revokedSession.revoke();
        sessionRepository.findById.mockResolvedValue(revokedSession);
        await expect(useCase.execute("session-id")).rejects.toThrow(SessionRevokedError);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
        expect(accountRepository.findById).not.toHaveBeenCalled();
        expect(userApi.getUserById).not.toHaveBeenCalled();
        expect(authorizationRoleApi.getRoleById).not.toHaveBeenCalled();
    });

    it("should throw AuthenticationAccountNotFoundError when account does not exist", async () => {
        const { useCase, accountRepository, userApi, authorizationRoleApi } = makeSut();
        accountRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute("session-id")).rejects.toThrow(AuthenticationAccountNotFoundError);
        expect(accountRepository.findById).toHaveBeenCalledTimes(1);
        expect(accountRepository.findById).toHaveBeenCalledWith("account-id");
        expect(userApi.getUserById).not.toHaveBeenCalled();
        expect(authorizationRoleApi.getRoleById).not.toHaveBeenCalled();
    });

    it("should propagate session repository errors", async () => {
        const { useCase, sessionRepository, accountRepository } = makeSut();
        sessionRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("session-id")).rejects.toThrow("Database error");
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(accountRepository.findById).not.toHaveBeenCalled();
    });

    it("should propagate account repository errors", async () => {
        const { useCase, accountRepository, userApi, authorizationRoleApi } = makeSut();
        accountRepository.findById.mockRejectedValue(new Error("Account lookup failed"));
        await expect(useCase.execute("session-id")).rejects.toThrow("Account lookup failed");
        expect(accountRepository.findById).toHaveBeenCalledWith("account-id");
        expect(userApi.getUserById).not.toHaveBeenCalled();
        expect(authorizationRoleApi.getRoleById).not.toHaveBeenCalled();
    });

    it("should propagate user lookup errors", async () => {
        const { useCase, userApi, authorizationRoleApi } = makeSut();
        userApi.getUserById.mockRejectedValue(new Error("User lookup failed"));
        await expect(useCase.execute("session-id")).rejects.toThrow("User lookup failed");
        expect(userApi.getUserById).toHaveBeenCalledWith("user-id");
        expect(authorizationRoleApi.getRoleById).not.toHaveBeenCalled();
    });

    it("should propagate role lookup errors", async () => {
        const { useCase, authorizationRoleApi } = makeSut();
        authorizationRoleApi.getRoleById.mockRejectedValue(new Error("Role lookup failed"));
        await expect(useCase.execute("session-id")).rejects.toThrow("Role lookup failed");
        expect(authorizationRoleApi.getRoleById).toHaveBeenCalledWith("role-id");
    });

    it("should return the authentication account information from the session", async () => {
        const { useCase } = makeSut();
        const result = await useCase.execute("session-id");
        expect(result.authenticationAccountId).toBe("account-id");
        expect(result.userId).toBe("user-id");
        expect(result.email).toBe("john@company.com");
    });

    it("should return the tenant and role information from the identity user", async () => {
        const { useCase } = makeSut();
        const result = await useCase.execute("session-id");
        expect(result.tenantId).toBe("tenant-id");
        expect(result.roleCode).toBe("USER");
    });
});
