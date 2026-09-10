import { User } from "../../../domain/entities";
import { UserNotFoundError } from "../../../domain/errors";
import { Email } from "../../../domain/value-objects";
import { AuthorizationRoleApiSpy, UserRepositorySpy } from "../../../test-doubles";
import { ChangeRoleUserUseCase } from "./index";
import type { ChangeRoleUserInput } from "./input";

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

const makeInput = (): ChangeRoleUserInput => ({
    id: "user-id",
    roleId: "new-role-id",
});

const makeSut = () => {
    const userRepository = new UserRepositorySpy();
    const authorizationRoleApi = new AuthorizationRoleApiSpy();
    userRepository.get.mockResolvedValue(makeUser());
    userRepository.update.mockResolvedValue(undefined);
    const useCase = new ChangeRoleUserUseCase(userRepository, authorizationRoleApi);
    return { useCase, userRepository, authorizationRoleApi };
};

describe("ChangeRoleUserUseCase", () => {
    it("should change the user's role successfully", async () => {
        const { useCase, userRepository, authorizationRoleApi } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(userRepository.get).toHaveBeenCalledWith("user-id");
        expect(authorizationRoleApi.validate).toHaveBeenCalledWith("new-role-id");
        expect(authorizationRoleApi.validateForTenant).toHaveBeenCalledWith({
            roleId: "new-role-id",
            tenantId: "tenant-id",
        });
        expect(userRepository.update).toHaveBeenCalledTimes(1);
        expect(userRepository.update).toHaveBeenCalledWith(
            expect.objectContaining({ id: "user-id", roleId: "new-role-id" }),
        );
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

    it("should validate that the role exists", async () => {
        const { useCase, authorizationRoleApi } = makeSut();
        await useCase.execute(makeInput());
        expect(authorizationRoleApi.validate).toHaveBeenCalledTimes(1);
        expect(authorizationRoleApi.validate).toHaveBeenCalledWith("new-role-id");
    });

    it("should validate that the role is enabled for the user's tenant", async () => {
        const { useCase, authorizationRoleApi } = makeSut();
        await useCase.execute(makeInput());
        expect(authorizationRoleApi.validateForTenant).toHaveBeenCalledTimes(1);
        expect(authorizationRoleApi.validateForTenant).toHaveBeenCalledWith({
            roleId: "new-role-id",
            tenantId: "tenant-id",
        });
    });

    it("should not validate the role for the tenant when role validation fails", async () => {
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

    it("should not update the user when role validation fails", async () => {
        const { useCase, authorizationRoleApi, userRepository } = makeSut();
        authorizationRoleApi.validate.mockRejectedValue(new Error("Role not found"));
        await expect(useCase.execute(makeInput())).rejects.toThrow();
        expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
