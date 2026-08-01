import { User } from "../../../domain/entities";
import { InvalidFirstNameError, UserNotFoundError } from "../../../domain/errors";
import { Email } from "../../../domain/value-objects";
import { UserRepositorySpy } from "../../../test-doubles";
import { UpdateUserUseCase } from "./index";
import type { UpdateUserInput } from "./input";

const makeUser = () =>
    User.create({
        id: "user-id",
        firstName: "John",
        lastName: "Doe",
        email: Email.create("john@company.com"),
        tenantId: "tenant-id",
        roleId: "role-id",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        suspendedAt: null,
    });

const makeInput = (): UpdateUserInput => ({
    id: "user-id",
    firstName: "Jane",
    lastName: "Smith",
    roleId: "new-role-id",
});

describe("UpdateUserUseCase", () => {
    const makeSut = () => {
        const userRepository = new UserRepositorySpy();
        userRepository.get.mockResolvedValue(makeUser());
        userRepository.update.mockResolvedValue(undefined);
        const useCase = new UpdateUserUseCase(userRepository);
        return { useCase, userRepository };
    };

    it("should update a user successfully", async () => {
        const { useCase, userRepository } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(userRepository.get).toHaveBeenCalledWith("user-id");
        expect(userRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: "user-id" });
    });

    it("should throw UserNotFoundError when user does not exist", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.get.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(UserNotFoundError);
        expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate domain errors", async () => {
        const { useCase, userRepository } = makeSut();
        const input = makeInput();
        input.firstName = "";
        await expect(useCase.execute(input)).rejects.toThrow(InvalidFirstNameError);
        expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
