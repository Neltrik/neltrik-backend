import { Company } from "../../../../domain/entities";
import { CompanyNotFoundError } from "../../../../domain/errors";
import { CompanyRepositorySpy, TenantApiSpy } from "../../../../test-doubles";
import { SuspendCompanyUseCase } from "./index";
import type { SuspendCompanyInput } from "./input";

describe("SuspendCompanyUseCase", () => {
    const makeSut = () => {
        const tenantApi = new TenantApiSpy();
        const companyRepository = new CompanyRepositorySpy();
        const suspendCompanyUseCase = new SuspendCompanyUseCase(tenantApi, companyRepository);
        return { suspendCompanyUseCase, tenantApi, companyRepository };
    };

    const makeInput = (): SuspendCompanyInput => ({ actorTenantId: "tenant-id", id: "company-id" });

    const makeCompany = (): Company =>
        Company.create({
            id: "company-id",
            tenantId: "tenant-id",
            name: "Company Name",
            slug: "company-name",
            createdAt: new Date(),
        });

    describe("execute", () => {
        it("should validate the tenant, suspend the company and return its data", async () => {
            const { suspendCompanyUseCase, tenantApi, companyRepository } = makeSut();
            const input = makeInput();
            const company = makeCompany();
            companyRepository.findById.mockResolvedValue(company);
            const result = await suspendCompanyUseCase.execute(input);
            expect(tenantApi.validate).toHaveBeenCalledTimes(1);
            expect(tenantApi.validate).toHaveBeenCalledWith(input.actorTenantId);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(companyRepository.update).toHaveBeenCalledTimes(1);
            expect(companyRepository.update).toHaveBeenCalledWith(company);
            expect(result).toEqual({
                id: company.id,
                tenantId: company.tenantId,
                name: company.name,
                slug: company.slug,
                status: company.status,
                createdAt: company.createdAt,
                updatedAt: company.updatedAt,
            });
            expect(result.status).toBe("SUSPENDED");
        });

        it("should throw CompanyNotFoundError when the company does not exist", async () => {
            const { suspendCompanyUseCase, tenantApi, companyRepository } = makeSut();
            const input = makeInput();
            companyRepository.findById.mockResolvedValue(null);
            await expect(suspendCompanyUseCase.execute(input)).rejects.toThrow(CompanyNotFoundError);
            expect(tenantApi.validate).toHaveBeenCalledTimes(1);
            expect(tenantApi.validate).toHaveBeenCalledWith(input.actorTenantId);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(companyRepository.update).not.toHaveBeenCalled();
        });

        it("should propagate errors when validating the tenant", async () => {
            const { suspendCompanyUseCase, tenantApi, companyRepository } = makeSut();
            const input = makeInput();
            tenantApi.validate.mockRejectedValue(new Error("Tenant validation failed"));
            await expect(suspendCompanyUseCase.execute(input)).rejects.toThrow("Tenant validation failed");
            expect(tenantApi.validate).toHaveBeenCalledTimes(1);
            expect(tenantApi.validate).toHaveBeenCalledWith(input.actorTenantId);
            expect(companyRepository.findById).not.toHaveBeenCalled();
            expect(companyRepository.update).not.toHaveBeenCalled();
        });

        it("should propagate errors when searching for the company", async () => {
            const { suspendCompanyUseCase, tenantApi, companyRepository } = makeSut();
            const input = makeInput();
            companyRepository.findById.mockRejectedValue(new Error("Failed to find company"));
            await expect(suspendCompanyUseCase.execute(input)).rejects.toThrow("Failed to find company");
            expect(tenantApi.validate).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.update).not.toHaveBeenCalled();
        });

        it("should propagate errors when updating the company", async () => {
            const { suspendCompanyUseCase, tenantApi, companyRepository } = makeSut();
            const input = makeInput();
            const company = makeCompany();
            companyRepository.findById.mockResolvedValue(company);
            companyRepository.update.mockRejectedValue(new Error("Failed to suspend company"));
            await expect(suspendCompanyUseCase.execute(input)).rejects.toThrow("Failed to suspend company");
            expect(tenantApi.validate).toHaveBeenCalledTimes(1);
            expect(tenantApi.validate).toHaveBeenCalledWith(input.actorTenantId);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.update).toHaveBeenCalledTimes(1);
            expect(companyRepository.update).toHaveBeenCalledWith(company);
        });
    });
});
