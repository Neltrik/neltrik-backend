import type { TenantApi } from "@/core/tenant/api";

import { Company } from "../../../../domain/entities";
import { CompanyNotFoundError } from "../../../../domain/errors";
import { CompanyRepositorySpy, MembershipRepositorySpy } from "../../../../test-doubles";
import { GetCompanyUseCase } from "./index";
import type { GetCompanyInput } from "./input";

const makeCompany = () =>
    Company.create({
        id: "company-id",
        tenantId: "tenant-id",
        name: "Company Name",
        slug: "company-name",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
    });

describe("GetCompanyUseCase", () => {
    const makeSut = () => {
        const isPlatformTenantMock = jest.fn().mockResolvedValue(false);
        const tenantApi = { isPlatformTenant: isPlatformTenantMock } satisfies Pick<TenantApi, "isPlatformTenant">;
        const companyRepository = new CompanyRepositorySpy();
        companyRepository.findById.mockResolvedValue(makeCompany());
        const membershipRepository = new MembershipRepositorySpy();
        membershipRepository.findActiveByUserAndCompany.mockResolvedValue({} as never);
        const getCompanyUseCase = new GetCompanyUseCase(
            tenantApi as unknown as TenantApi,
            companyRepository,
            membershipRepository,
        );
        return { getCompanyUseCase, tenantApi, companyRepository, membershipRepository };
    };
    const makeInput = (): GetCompanyInput => ({ id: "company-id", actorTenantId: "tenant-id", actorUserId: "user-id" });

    describe("execute", () => {
        it("should return company details successfully", async () => {
            const { getCompanyUseCase, tenantApi, companyRepository, membershipRepository } = makeSut();
            const input = makeInput();
            const company = makeCompany();
            companyRepository.findById.mockResolvedValue(company);
            const result = await getCompanyUseCase.execute(input);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledTimes(1);
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledWith(input.actorUserId, company.id);
            expect(result.id).toBe(company.id);
            expect(result.tenantId).toBe(company.tenantId);
            expect(result.name).toBe(company.name);
            expect(result.slug).toBe(company.slug);
            expect(result.status).toBe(company.status);
            expect(result.createdAt).toBe(company.createdAt);
            expect(result.updatedAt).toBe(company.updatedAt);
        });

        it("should return company details when the actor is a platform tenant", async () => {
            const { getCompanyUseCase, tenantApi, companyRepository, membershipRepository } = makeSut();
            const input = makeInput();
            const company = Company.create({
                id: "company-id",
                tenantId: "another-tenant-id",
                name: "Company Name",
                slug: "company-name",
                createdAt: new Date("2025-01-01T00:00:00.000Z"),
            });
            companyRepository.findById.mockResolvedValue(company);
            tenantApi.isPlatformTenant.mockResolvedValue(true);
            const result = await getCompanyUseCase.execute(input);
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
            expect(membershipRepository.findActiveByUserAndCompany).not.toHaveBeenCalled();
            expect(result.id).toBe(company.id);
            expect(result.tenantId).toBe(company.tenantId);
        });

        it("should throw CompanyNotFoundError when the company does not exist", async () => {
            const { getCompanyUseCase, tenantApi, companyRepository, membershipRepository } = makeSut();
            const input = makeInput();
            companyRepository.findById.mockResolvedValue(null);
            await expect(getCompanyUseCase.execute(input)).rejects.toThrow(CompanyNotFoundError);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(tenantApi.isPlatformTenant).not.toHaveBeenCalled();
            expect(membershipRepository.findActiveByUserAndCompany).not.toHaveBeenCalled();
        });

        it("should throw CompanyNotFoundError when the actor does not have an active membership", async () => {
            const { getCompanyUseCase, tenantApi, companyRepository, membershipRepository } = makeSut();
            const input = makeInput();
            const company = makeCompany();
            companyRepository.findById.mockResolvedValue(company);
            tenantApi.isPlatformTenant.mockResolvedValue(false);
            membershipRepository.findActiveByUserAndCompany.mockResolvedValue(null);
            await expect(getCompanyUseCase.execute(input)).rejects.toThrow(CompanyNotFoundError);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledTimes(1);
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledWith(input.actorUserId, company.id);
        });

        it("should propagate errors when searching for the company", async () => {
            const { getCompanyUseCase, tenantApi, companyRepository, membershipRepository } = makeSut();
            const input = makeInput();
            companyRepository.findById.mockRejectedValue(new Error("Failed to find company"));
            await expect(getCompanyUseCase.execute(input)).rejects.toThrow("Failed to find company");
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(tenantApi.isPlatformTenant).not.toHaveBeenCalled();
            expect(membershipRepository.findActiveByUserAndCompany).not.toHaveBeenCalled();
        });

        it("should propagate errors when validating the platform tenant", async () => {
            const { getCompanyUseCase, tenantApi, companyRepository, membershipRepository } = makeSut();
            const input = makeInput();
            tenantApi.isPlatformTenant.mockRejectedValue(new Error("Tenant validation failed"));
            await expect(getCompanyUseCase.execute(input)).rejects.toThrow("Tenant validation failed");
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
            expect(membershipRepository.findActiveByUserAndCompany).not.toHaveBeenCalled();
        });

        it("should propagate errors when searching for an active membership", async () => {
            const { getCompanyUseCase, tenantApi, companyRepository, membershipRepository } = makeSut();
            const input = makeInput();
            membershipRepository.findActiveByUserAndCompany.mockRejectedValue(new Error("Failed to find membership"));
            await expect(getCompanyUseCase.execute(input)).rejects.toThrow("Failed to find membership");
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledTimes(1);
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledWith(input.actorUserId, input.id);
        });
    });
});
