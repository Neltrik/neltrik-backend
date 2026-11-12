import { Company } from "../../../../domain/entities";
import { CompanyRepositorySpy } from "../../../../test-doubles";
import { TenantApiSpy } from "../../../../test-doubles";
import { ListCompaniesUseCase } from "./index";
import type { ListCompaniesInput } from "./input";

const makeInput = (): ListCompaniesInput => ({ actorTenantId: "tenant-id", limit: 20 });

const makeCompany = (id = "company-id"): Company =>
    Company.create({ id, tenantId: "tenant-id", name: "Test Company", createdAt: new Date(), slug: "" });

describe("ListCompaniesUseCase", () => {
    const makeSut = () => {
        const tenantApi = new TenantApiSpy();
        const companyRepository = new CompanyRepositorySpy();
        const useCase = new ListCompaniesUseCase(tenantApi, companyRepository);
        return { useCase, tenantApi, companyRepository };
    };

    it("should return all companies successfully when actor is a platform admin", async () => {
        const { useCase, tenantApi, companyRepository } = makeSut();
        const input = makeInput();
        const mockCompanies = [makeCompany()];
        tenantApi.isPlatformTenant.mockResolvedValue(true);
        companyRepository.findAll.mockResolvedValue(mockCompanies);
        const result = await useCase.execute(input);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(companyRepository.findAll).toHaveBeenCalledTimes(1);
        expect(companyRepository.findAll).toHaveBeenCalledWith({ cursor: input.cursor, limit: input.limit });
        expect(companyRepository.findByTenant).not.toHaveBeenCalled();
        expect(result).toEqual({ companies: mockCompanies, meta: { nextCursor: null, hasMore: false } });
    });

    it("should return companies by tenant successfully when actor is not a platform admin", async () => {
        const { useCase, tenantApi, companyRepository } = makeSut();
        const input = makeInput();
        const mockCompanies = [makeCompany()];
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        companyRepository.findByTenant.mockResolvedValue(mockCompanies);
        const result = await useCase.execute(input);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(companyRepository.findByTenant).toHaveBeenCalledTimes(1);
        expect(companyRepository.findByTenant).toHaveBeenCalledWith({
            tenantId: input.actorTenantId,
            cursor: input.cursor,
            limit: input.limit,
        });
        expect(companyRepository.findAll).not.toHaveBeenCalled();
        expect(result).toEqual({ companies: mockCompanies, meta: { nextCursor: null, hasMore: false } });
    });

    it("should return an empty list when no companies are found", async () => {
        const { useCase, tenantApi, companyRepository } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        companyRepository.findByTenant.mockResolvedValue([]);
        const result = await useCase.execute(makeInput());
        expect(companyRepository.findByTenant).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ companies: [], meta: { nextCursor: null, hasMore: false } });
    });

    it("should return the first page and next cursor when there are more companies than the limit", async () => {
        const { useCase, tenantApi, companyRepository } = makeSut();
        const input = { ...makeInput(), limit: 2 };
        const mockCompanies = [makeCompany("company-1"), makeCompany("company-2"), makeCompany("company-3")];
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        companyRepository.findByTenant.mockResolvedValue(mockCompanies);
        const result = await useCase.execute(input);
        expect(result).toEqual({
            companies: [mockCompanies[0], mockCompanies[1]],
            meta: { nextCursor: "company-2", hasMore: true },
        });
    });

    it("should propagate repository errors when finding all companies", async () => {
        const { useCase, tenantApi, companyRepository } = makeSut();
        const error = new Error("Database error");
        tenantApi.isPlatformTenant.mockResolvedValue(true);
        companyRepository.findAll.mockRejectedValue(error);
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(companyRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should propagate repository errors when finding companies by tenant", async () => {
        const { useCase, tenantApi, companyRepository } = makeSut();
        const error = new Error("Database error");
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        companyRepository.findByTenant.mockRejectedValue(error);
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(companyRepository.findByTenant).toHaveBeenCalledTimes(1);
    });

    it("should propagate tenant API errors", async () => {
        const { useCase, tenantApi, companyRepository } = makeSut();
        const error = new Error("Tenant API error");
        tenantApi.isPlatformTenant.mockRejectedValue(error);
        await expect(useCase.execute(makeInput())).rejects.toThrow("Tenant API error");
        expect(companyRepository.findAll).not.toHaveBeenCalled();
        expect(companyRepository.findByTenant).not.toHaveBeenCalled();
    });
});
