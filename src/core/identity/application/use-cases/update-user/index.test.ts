import { User } from "../../../domain/entities";
import { InvalidFirstNameError, UserNotFoundError } from "../../../domain/errors";
import { Email } from "../../../domain/value-objects";
import { AuthorizationRoleApiSpy, UserRepositorySpy } from "../../../test-doubles";
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
        const authorizationRoleApi = new AuthorizationRoleApiSpy();
        userRepository.get.mockResolvedValue(makeUser());
        userRepository.update.mockResolvedValue(undefined);
        const useCase = new UpdateUserUseCase(userRepository, authorizationRoleApi);
        return { useCase, userRepository, authorizationRoleApi };
    };

    it("should update a user successfully", async () => {
        const { useCase, userRepository, authorizationRoleApi } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(userRepository.get).toHaveBeenCalledWith("user-id");
        expect(authorizationRoleApi.validate).toHaveBeenCalledWith("new-role-id");
        expect(authorizationRoleApi.validateForTenant).toHaveBeenCalledWith({
            roleId: "new-role-id",
            tenantId: "tenant-id",
        });
        expect(userRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: "user-id" });
    });

    it("should throw UserNotFoundError when user does not exist", async () => {
        const { useCase, userRepository, authorizationRoleApi } = makeSut();
        userRepository.get.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(UserNotFoundError);
        expect(authorizationRoleApi.validate).not.toHaveBeenCalled();
        expect(authorizationRoleApi.validateForTenant).not.toHaveBeenCalled();
        expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("should not validate the role when roleId is not provided", async () => {
        const { useCase, authorizationRoleApi } = makeSut();
        await useCase.execute({ id: "user-id", firstName: "Jane" });
        expect(authorizationRoleApi.validate).not.toHaveBeenCalled();
        expect(authorizationRoleApi.validateForTenant).not.toHaveBeenCalled();
    });

    it("should propagate role validation errors", async () => {
        const { useCase, authorizationRoleApi, userRepository } = makeSut();
        authorizationRoleApi.validate.mockRejectedValue(new Error("Role not found"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Role not found");
        expect(authorizationRoleApi.validateForTenant).not.toHaveBeenCalled();
        expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate role-tenant validation errors", async () => {
        const { useCase, authorizationRoleApi, userRepository } = makeSut();
        authorizationRoleApi.validateForTenant.mockRejectedValue(new Error("Role is not enabled for tenant"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Role is not enabled for tenant");
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
