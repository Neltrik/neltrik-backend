import { User } from "../../../domain/entities";
import { Email } from "../../../domain/value-objects";
import { AuthorizationRoleApiSpy, UserRepositorySpy } from "../../../test-doubles";
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
        const authorizationRoleApi = new AuthorizationRoleApiSpy();
        authorizationRoleApi.getRoleById.mockResolvedValue({ id: "role-id", code: "RECRUITER", scope: "TENANT" });
        userRepository.list.mockResolvedValue([makeUser()]);
        const useCase = new GetUsersUseCase(userRepository, authorizationRoleApi);
        return { useCase, userRepository, authorizationRoleApi };
    };

    it("should return users successfully", async () => {
        const { useCase, userRepository, authorizationRoleApi } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(userRepository.list).toHaveBeenCalledWith("tenant-id");
        expect(authorizationRoleApi.getRoleById).toHaveBeenCalledWith("role-id");
        expect(result).toHaveLength(1);
        expect(result[0]?.role).toEqual({ id: "role-id", code: "RECRUITER", scope: "TENANT" });
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
