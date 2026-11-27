import type { IdGenerator } from "@/shared/id-generator";

import {
    AuthorizationRoleApiSpy,
    CompanyApiSpy,
    MembershipApiSpy,
    TenantRepositorySpy,
    UserApiSpy,
} from "../../../../test-doubles";
import { type SlugGenerator } from "../../../slug-generator";
import { CreateTenantUseCase } from "./index";
import type { CreateTenantInput } from "./input";

const makeInput = (): CreateTenantInput => ({
    name: "Acme Corp",
    type: "CUSTOMER",
    ownerRoleId: "owner-role-id",
    ownerEmail: "john@company.com",
    ownerFirstName: "John",
    ownerLastName: "Doe",
});

describe("CreateTenantUseCase", () => {
    const makeSut = () => {
        const authorizationRoleApi = new AuthorizationRoleApiSpy();
        authorizationRoleApi.validate.mockResolvedValue(undefined);
        const userApi = new UserApiSpy();
        userApi.create.mockResolvedValue({ id: "user-id" });
        userApi.delete.mockResolvedValue({ id: "user-id" });
        const companyApi = new CompanyApiSpy();
        companyApi.create.mockResolvedValue({ id: "company-id" });
        companyApi.delete.mockResolvedValue(undefined);
        const membershipApi = new MembershipApiSpy();
        membershipApi.create.mockResolvedValue(undefined);
        const tenantRepository = new TenantRepositorySpy();
        tenantRepository.create.mockResolvedValue(undefined);
        tenantRepository.delete.mockResolvedValue(undefined);
        const generateMock = jest.fn().mockReturnValue("tenant-id");
        const idGenerator = { generate: generateMock } satisfies IdGenerator;
        const slugGenerateMock = jest.fn().mockReturnValue("acme-corp-slug");
        const slugGenerator = { generate: slugGenerateMock } satisfies SlugGenerator;
        const useCase = new CreateTenantUseCase(
            authorizationRoleApi,
            companyApi,
            membershipApi,
            userApi,
            idGenerator,
            tenantRepository,
            slugGenerator,
        );
        return {
            useCase,
            authorizationRoleApi,
            companyApi,
            membershipApi,
            userApi,
            tenantRepository,
            generateMock,
            slugGenerateMock,
        };
    };

    it("should create a tenant successfully", async () => {
        const {
            useCase,
            authorizationRoleApi,
            companyApi,
            membershipApi,
            userApi,
            tenantRepository,
            generateMock,
            slugGenerateMock,
        } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(authorizationRoleApi.validate).toHaveBeenCalledTimes(1);
        expect(authorizationRoleApi.validate).toHaveBeenCalledWith("owner-role-id");
        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(slugGenerateMock).toHaveBeenNthCalledWith(1, "Acme Corp", "tenant-id");
        expect(tenantRepository.create).toHaveBeenCalledTimes(1);
        expect(userApi.create).toHaveBeenCalledTimes(1);
        expect(userApi.create).toHaveBeenCalledWith({
            email: "john@company.com",
            firstName: "John",
            lastName: "Doe",
            tenantId: "tenant-id",
        });
        expect(slugGenerateMock).toHaveBeenNthCalledWith(2, "Acme Corp", "tenant-id-default");
        expect(companyApi.create).toHaveBeenCalledTimes(1);
        expect(companyApi.create).toHaveBeenCalledWith({
            tenantId: "tenant-id",
            name: "Acme Corp",
            slug: "acme-corp-slug",
        });
        expect(membershipApi.create).toHaveBeenCalledTimes(1);
        expect(membershipApi.create).toHaveBeenCalledWith({
            companyId: "company-id",
            roleId: "owner-role-id",
            tenantId: "tenant-id",
            userId: "user-id",
        });
        expect(result).toEqual({ id: "tenant-id" });
    });

    it("should propagate role validation errors", async () => {
        const { useCase, authorizationRoleApi, userApi, generateMock } = makeSut();
        authorizationRoleApi.validate.mockRejectedValue(new Error("Invalid role"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Invalid role");
        expect(authorizationRoleApi.validate).toHaveBeenCalledTimes(1);
        expect(generateMock).not.toHaveBeenCalled();
        expect(userApi.create).not.toHaveBeenCalled();
    });

    it("should propagate user creation errors", async () => {
        const { useCase, userApi, tenantRepository } = makeSut();
        userApi.create.mockRejectedValue(new Error("User creation failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("User creation failed");
        expect(userApi.create).toHaveBeenCalledTimes(1);
        expect(tenantRepository.create).toHaveBeenCalledTimes(1);
        expect(tenantRepository.delete).toHaveBeenCalledTimes(1);
        expect(userApi.delete).not.toHaveBeenCalled();
    });

    it("should propagate tenant creation errors", async () => {
        const { useCase, tenantRepository, userApi, companyApi } = makeSut();
        tenantRepository.create.mockRejectedValue(new Error("Tenant creation failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Tenant creation failed");
        expect(tenantRepository.create).toHaveBeenCalledTimes(1);
        expect(userApi.create).not.toHaveBeenCalled();
        expect(companyApi.create).not.toHaveBeenCalled();
        expect(tenantRepository.delete).not.toHaveBeenCalled();
    });

    it("should propagate company creation errors and compensate tenant and user", async () => {
        const { useCase, userApi, tenantRepository, companyApi, membershipApi } = makeSut();
        companyApi.create.mockRejectedValue(new Error("Company creation failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Company creation failed");
        expect(userApi.create).toHaveBeenCalledTimes(1);
        expect(tenantRepository.create).toHaveBeenCalledTimes(1);
        expect(companyApi.create).toHaveBeenCalledTimes(1);
        expect(membershipApi.create).not.toHaveBeenCalled();
        expect(tenantRepository.delete).toHaveBeenCalledTimes(1);
        expect(tenantRepository.delete).toHaveBeenCalledWith("tenant-id");
        expect(userApi.delete).toHaveBeenCalledTimes(1);
        expect(userApi.delete).toHaveBeenCalledWith("user-id");
        expect(companyApi.delete).not.toHaveBeenCalled();
    });

    it("should propagate membership creation errors and compensate company, tenant and user", async () => {
        const { useCase, userApi, tenantRepository, companyApi, membershipApi } = makeSut();
        membershipApi.create.mockRejectedValue(new Error("Membership creation failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Membership creation failed");
        expect(userApi.create).toHaveBeenCalledTimes(1);
        expect(tenantRepository.create).toHaveBeenCalledTimes(1);
        expect(companyApi.create).toHaveBeenCalledTimes(1);
        expect(membershipApi.create).toHaveBeenCalledTimes(1);
        expect(companyApi.delete).toHaveBeenCalledTimes(1);
        expect(companyApi.delete).toHaveBeenCalledWith("company-id");
        expect(tenantRepository.delete).toHaveBeenCalledTimes(1);
        expect(tenantRepository.delete).toHaveBeenCalledWith("tenant-id");
        expect(userApi.delete).toHaveBeenCalledTimes(1);
        expect(userApi.delete).toHaveBeenCalledWith("user-id");
    });

    it("should propagate tenant slug generation errors", async () => {
        const { useCase, slugGenerateMock, tenantRepository, userApi, companyApi } = makeSut();
        slugGenerateMock.mockImplementationOnce(() => {
            throw new Error("Slug generation failed");
        });
        await expect(useCase.execute(makeInput())).rejects.toThrow("Slug generation failed");
        expect(slugGenerateMock).toHaveBeenCalledTimes(1);
        expect(tenantRepository.create).not.toHaveBeenCalled();
        expect(userApi.create).not.toHaveBeenCalled();
        expect(companyApi.create).not.toHaveBeenCalled();
    });

    it("should propagate company slug generation errors and compensate tenant and user", async () => {
        const { useCase, slugGenerateMock, tenantRepository, userApi, companyApi } = makeSut();
        slugGenerateMock.mockImplementationOnce(() => "acme-corp-slug");
        slugGenerateMock.mockImplementationOnce(() => {
            throw new Error("Company slug generation failed");
        });
        await expect(useCase.execute(makeInput())).rejects.toThrow("Company slug generation failed");
        expect(slugGenerateMock).toHaveBeenCalledTimes(2);
        expect(tenantRepository.create).toHaveBeenCalledTimes(1);
        expect(userApi.create).toHaveBeenCalledTimes(1);
        expect(companyApi.create).not.toHaveBeenCalled();
        expect(tenantRepository.delete).toHaveBeenCalledWith("tenant-id");
        expect(userApi.delete).toHaveBeenCalledWith("user-id");
        expect(companyApi.delete).not.toHaveBeenCalled();
    });
});
