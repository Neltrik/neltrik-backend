import { User } from "../../../domain/entities";
import { UserAlreadySuspendedError, UserNotFoundError } from "../../../domain/errors";
import { USER_STATUS } from "../../../domain/types";
import { Email } from "../../../domain/value-objects/email";
import { UserRepositorySpy } from "../../../test-doubles";
import { SuspendUserUseCase } from "./index";

const makeUser = () =>
    User.create({
        id: "user-id",
        firstName: "Omar",
        lastName: "Vargas",
        email: Email.create("omar@gmail.com"),
        tenantId: "tenant-id",
        roleId: "role-id",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        suspendedAt: null,
    });

describe("SuspendUserUseCase", () => {
    const makeSut = () => {
        const userRepository = new UserRepositorySpy();
        userRepository.get.mockResolvedValue(makeUser());
        userRepository.update.mockResolvedValue(undefined);
        const useCase = new SuspendUserUseCase(userRepository);
        return { useCase, userRepository };
    };

    it("should suspend a user successfully", async () => {
        const { useCase, userRepository } = makeSut();
        await useCase.execute("user-id");
        expect(userRepository.get).toHaveBeenCalledWith("user-id");
        expect(userRepository.update).toHaveBeenCalledTimes(1);
        const updatedUser = userRepository.update.mock.calls[0]![0];
        expect(updatedUser.status).toBe(USER_STATUS.SUSPENDED);
        expect(updatedUser.suspendedAt).toBeInstanceOf(Date);
    });

    it("should throw UserNotFoundError when user does not exist", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.get.mockResolvedValue(null);
        await expect(useCase.execute("user-id")).rejects.toThrow(UserNotFoundError);
        expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate domain errors", async () => {
        const { useCase, userRepository } = makeSut();
        const user = makeUser();
        user.suspend();
        userRepository.get.mockResolvedValue(user);
        await expect(useCase.execute("user-id")).rejects.toThrow(UserAlreadySuspendedError);
        expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("user-id")).rejects.toThrow("Database error");
    });
});
