import { User } from "../../../../domain/entities";
import { UserNotFoundError } from "../../../../domain/errors";
import { Email } from "../../../../domain/value-objects";
import { UserRepositorySpy } from "../../../../test-doubles";
import { DeleteUserOhsUseCase } from "./index";

const makeUser = () =>
    User.restore({
        id: "user-id",
        firstName: "John",
        lastName: "Doe",
        email: Email.create("john@company.com"),
        status: "ACTIVE",
        tenantId: "tenant-id",
        roleId: "role-id",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        suspendedAt: null,
    });

describe("DeleteUserOhsUseCase", () => {
    const makeSut = () => {
        const userRepository = new UserRepositorySpy();
        const useCase = new DeleteUserOhsUseCase(userRepository);
        return { useCase, userRepository };
    };

    it("should delete a user successfully", async () => {
        const { useCase, userRepository } = makeSut();
        const user = makeUser();
        userRepository.get.mockResolvedValue(user);
        userRepository.delete.mockResolvedValue(undefined);
        const result = await useCase.execute("user-id");
        expect(userRepository.get).toHaveBeenCalledTimes(1);
        expect(userRepository.get).toHaveBeenCalledWith("user-id");
        expect(userRepository.delete).toHaveBeenCalledTimes(1);
        expect(userRepository.delete).toHaveBeenCalledWith("user-id");
        expect(result).toEqual({ id: "user-id" });
    });

    it("should throw UserNotFoundError when user does not exist", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.get.mockResolvedValue(null);
        await expect(useCase.execute("user-id")).rejects.toThrow(UserNotFoundError);
        expect(userRepository.get).toHaveBeenCalledTimes(1);
        expect(userRepository.get).toHaveBeenCalledWith("user-id");
        expect(userRepository.delete).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when getting user", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.get.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("user-id")).rejects.toThrow("Database error");
        expect(userRepository.get).toHaveBeenCalledTimes(1);
        expect(userRepository.get).toHaveBeenCalledWith("user-id");
        expect(userRepository.delete).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when deleting user", async () => {
        const { useCase, userRepository } = makeSut();
        const user = makeUser();
        userRepository.get.mockResolvedValue(user);
        userRepository.delete.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("user-id")).rejects.toThrow("Database error");
        expect(userRepository.get).toHaveBeenCalledTimes(1);
        expect(userRepository.get).toHaveBeenCalledWith("user-id");
        expect(userRepository.delete).toHaveBeenCalledTimes(1);
        expect(userRepository.delete).toHaveBeenCalledWith("user-id");
    });
});
