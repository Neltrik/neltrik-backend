import { UnauthorizedError } from "@/shared/errors";
import type { IdGenerator } from "@/shared/id-generator";

import { EmailAlreadyExistsError } from "../../../domain/errors";
import { AuthorizationRoleApiSpy, TenantApiSpy, UserRepositorySpy } from "../../../test-doubles";
import { RegisterUserUseCase } from "./index";
import type { RegisterUserInput } from "./input";

const makeInput = (): RegisterUserInput => ({
    firstName: "John",
    lastName: "Doe",
    email: "john@company.com",
    tenantId: "tenant-id",
    roleId: "role-id",
});

describe("RegisterUserUseCase", () => {
    const makeSut = () => {
        const userRepository = new UserRepositorySpy();
        userRepository.create.mockResolvedValue(undefined);
        userRepository.existsByEmail.mockResolvedValue(false);
        const authorizationRoleApi = new AuthorizationRoleApiSpy();
        const tenantApi = new TenantApiSpy();
        tenantApi.validate.mockResolvedValue(undefined);
        const generateMock = jest.fn().mockReturnValue("user-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const useCase = new RegisterUserUseCase(userRepository, authorizationRoleApi, tenantApi, idGenerator);
        return { useCase, userRepository, authorizationRoleApi, tenantApi, generateMock };
    };

    it("should reject the operation when tenantId is not provided", async () => {
        const { useCase, userRepository, tenantApi, authorizationRoleApi } = makeSut();
        await expect(useCase.execute({ ...makeInput(), tenantId: "" })).rejects.toThrow(UnauthorizedError);
        expect(tenantApi.validate).not.toHaveBeenCalled();
        expect(authorizationRoleApi.validate).not.toHaveBeenCalled();
        expect(authorizationRoleApi.validateForTenant).not.toHaveBeenCalled();
        expect(userRepository.existsByEmail).not.toHaveBeenCalled();
        expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("should register a user successfully", async () => {
        const { useCase, userRepository, authorizationRoleApi, tenantApi, generateMock } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(tenantApi.validate).toHaveBeenCalledWith("tenant-id");
        expect(authorizationRoleApi.validate).toHaveBeenCalledWith("role-id");
        expect(authorizationRoleApi.validateForTenant).toHaveBeenCalledWith({
            roleId: "role-id",
            tenantId: "tenant-id",
        });
        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(userRepository.existsByEmail).toHaveBeenCalledTimes(1);
        expect(userRepository.create).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: "user-id" });
    });

    it("should throw EmailAlreadyExistsError when email already exists", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.existsByEmail.mockResolvedValue(true);
        await expect(useCase.execute(makeInput())).rejects.toThrow(EmailAlreadyExistsError);
        expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate tenant validation errors", async () => {
        const { useCase, tenantApi } = makeSut();
        tenantApi.validate.mockRejectedValue(new Error("Tenant not found"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Tenant not found");
    });

    it("should propagate role validation errors", async () => {
        const { useCase, authorizationRoleApi, userRepository } = makeSut();
        authorizationRoleApi.validate.mockRejectedValue(new Error("Role not found"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Role not found");
        expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate role-tenant validation errors", async () => {
        const { useCase, authorizationRoleApi, userRepository } = makeSut();
        authorizationRoleApi.validateForTenant.mockRejectedValue(new Error("Role is not enabled for tenant"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Role is not enabled for tenant");
        expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, userRepository } = makeSut();
        userRepository.create.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
