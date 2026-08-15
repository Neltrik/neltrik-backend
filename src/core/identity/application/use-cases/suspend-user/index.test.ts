import { type AuthorizationPolicyApi } from "@/core/authorization/api";

import { User } from "../../../domain/entities";
import { UserAlreadySuspendedError, UserNotFoundError } from "../../../domain/errors";
import { USER_STATUS } from "../../../domain/types";
import { Email } from "../../../domain/value-objects/email";
import { UserRepositorySpy } from "../../../test-doubles";
import { SuspendUserUseCase } from "./index";

const makeUser = (id: string, roleId: string) =>
    User.create({
        id,
        firstName: "Omar",
        lastName: "Vargas",
        email: Email.create("omar@gmail.com"),
        tenantId: "tenant-id",
        roleId,
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        suspendedAt: null,
    });

describe("SuspendUserUseCase", () => {
    const makeSut = () => {
        const userRepository = new UserRepositorySpy();
        const canSuspend = jest.fn().mockResolvedValue(undefined);
        const authorizationPolicyApi = {
            canSuspend,
        } as AuthorizationPolicyApi;
        userRepository.get
            .mockResolvedValueOnce(makeUser("actor-user-id", "actor-role-id"))
            .mockResolvedValueOnce(makeUser("target-user-id", "target-role-id"));
        userRepository.update.mockResolvedValue(undefined);
        const useCase = new SuspendUserUseCase(userRepository, authorizationPolicyApi);
        return { useCase, userRepository, authorizationPolicyApi, canSuspend };
    };

    it("should suspend a user successfully", async () => {
        const { useCase, userRepository, authorizationPolicyApi } = makeSut();
        await useCase.execute({ actorUserId: "actor-user-id", targetUserId: "target-user-id" });
        expect(userRepository.get).toHaveBeenCalledTimes(2);
        expect(userRepository.get).toHaveBeenNthCalledWith(1, "actor-user-id");
        expect(userRepository.get).toHaveBeenNthCalledWith(2, "target-user-id");
        expect(authorizationPolicyApi.canSuspend).toHaveBeenCalledTimes(1);
        expect(authorizationPolicyApi.canSuspend).toHaveBeenCalledWith({
            actorRoleId: "actor-role-id",
            targetRoleId: "target-role-id",
        });
        expect(userRepository.update).toHaveBeenCalledTimes(1);
        const updatedUser = userRepository.update.mock.calls[0]![0];
        expect(updatedUser.id).toBe("target-user-id");
        expect(updatedUser.status).toBe(USER_STATUS.SUSPENDED);
        expect(updatedUser.suspendedAt).toBeInstanceOf(Date);
    });

    it("should throw UserNotFoundError when actor user does not exist", async () => {
        const { useCase, userRepository, authorizationPolicyApi } = makeSut();
        userRepository.get.mockReset();
        userRepository.get.mockResolvedValueOnce(null);
        await expect(useCase.execute({ actorUserId: "actor-user-id", targetUserId: "target-user-id" })).rejects.toThrow(
            UserNotFoundError,
        );
        expect(userRepository.get).toHaveBeenCalledTimes(1);
        expect(userRepository.get).toHaveBeenCalledWith("actor-user-id");
        expect(authorizationPolicyApi.canSuspend).not.toHaveBeenCalled();
        expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("should throw UserNotFoundError when target user does not exist", async () => {
        const { useCase, userRepository, authorizationPolicyApi } = makeSut();
        userRepository.get.mockReset();
        userRepository.get
            .mockResolvedValueOnce(makeUser("actor-user-id", "actor-role-id"))
            .mockResolvedValueOnce(null);
        await expect(useCase.execute({ actorUserId: "actor-user-id", targetUserId: "target-user-id" })).rejects.toThrow(
            UserNotFoundError,
        );
        expect(userRepository.get).toHaveBeenCalledTimes(2);
        expect(authorizationPolicyApi.canSuspend).not.toHaveBeenCalled();
        expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate authorization policy errors", async () => {
        const { useCase, userRepository, canSuspend } = makeSut();
        canSuspend.mockRejectedValue(new Error("Authorization policy rejected the operation"));
        await expect(useCase.execute({ actorUserId: "actor-user-id", targetUserId: "target-user-id" })).rejects.toThrow(
            "Authorization policy rejected the operation",
        );
        expect(canSuspend).toHaveBeenCalledWith({
            actorRoleId: "actor-role-id",
            targetRoleId: "target-role-id",
        });
        expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate domain errors", async () => {
        const { useCase, userRepository, authorizationPolicyApi } = makeSut();
        const targetUser = makeUser("target-user-id", "target-role-id");
        targetUser.suspend();
        userRepository.get.mockReset();
        userRepository.get
            .mockResolvedValueOnce(makeUser("actor-user-id", "actor-role-id"))
            .mockResolvedValueOnce(targetUser);
        await expect(useCase.execute({ actorUserId: "actor-user-id", targetUserId: "target-user-id" })).rejects.toThrow(
            UserAlreadySuspendedError,
        );
        expect(authorizationPolicyApi.canSuspend).toHaveBeenCalledWith({
            actorRoleId: "actor-role-id",
            targetRoleId: "target-role-id",
        });
        expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute({ actorUserId: "actor-user-id", targetUserId: "target-user-id" })).rejects.toThrow(
            "Database error",
        );
    });
});
