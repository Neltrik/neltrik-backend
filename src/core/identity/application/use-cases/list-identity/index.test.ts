import { User } from "../../../domain/entities";
import { Email } from "../../../domain/value-objects";
import { UserRepositorySpy } from "../../../test-doubles";
import { GetUsersUseCase } from "./index";
import type { GetUsersInput } from "./input";

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
const makeInput = (): GetUsersInput => ({
    tenantId: "tenant-id",
});

describe("GetUsersUseCase", () => {
    const makeSut = () => {
        const userRepository = new UserRepositorySpy();
        userRepository.list.mockResolvedValue([makeUser()]);
        const useCase = new GetUsersUseCase(userRepository);
        return { useCase, userRepository };
    };

    it("should return users successfully", async () => {
        const { useCase, userRepository } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(userRepository.list).toHaveBeenCalledWith("tenant-id");
        expect(result).toHaveLength(1);
    });

    it("should return an empty list", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.list.mockResolvedValue([]);
        const result = await useCase.execute(makeInput());
        expect(result).toEqual([]);
    });

    it("should propagate repository errors", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.list.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
