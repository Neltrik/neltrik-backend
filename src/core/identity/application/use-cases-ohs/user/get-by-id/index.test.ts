import { User } from "../../../../domain/entities";
import { UserNotFoundError } from "../../../../domain/errors";
import { Email } from "../../../../domain/value-objects";
import { UserRepositorySpy } from "../../../../test-doubles";
import { GetUserByIdOhsUseCase } from "./index";

const makeUser = () =>
    User.create({
        id: "user-id",
        firstName: "John",
        lastName: "Doe",
        email: Email.create("john.doe@example.com"),
        tenantId: "tenant-id",
        roleId: "role-id",
        suspendedAt: null,
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

describe("GetUserByIdOhsUseCase", () => {
    const makeSut = () => {
        const userRepository = new UserRepositorySpy();
        userRepository.get.mockResolvedValue(makeUser());
        const useCase = new GetUserByIdOhsUseCase(userRepository);
        return { useCase, userRepository };
    };

    it("should return user details successfully", async () => {
        const { useCase, userRepository } = makeSut();
        const user = await useCase.execute("user-id");
        expect(userRepository.get).toHaveBeenCalledTimes(1);
        expect(userRepository.get).toHaveBeenCalledWith("user-id");
        expect(user.id).toBe("user-id");
        expect(user.roleId).toBe("role-id");
        expect(user.firstName).toBe("John");
        expect(user.lastName).toBe("Doe");
        expect(user.email.value).toBe("john.doe@example.com");
        expect(user.tenantId).toBe("tenant-id");
        expect(user.status).toBe("ACTIVE");
        expect(user.suspendedAt).toBeNull();
        expect(user.createdAt).toEqual(new Date("2025-01-01T00:00:00.000Z"));
        expect(user.updatedAt).toEqual(new Date("2025-01-01T00:00:00.000Z"));
    });

    it("should throw UserNotFoundError when the user does not exist", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.get.mockResolvedValue(null);
        await expect(useCase.execute("user-id")).rejects.toThrow(UserNotFoundError);
    });

    it("should propagate user repository errors", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.get.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("user-id")).rejects.toThrow("Database error");
    });
});
