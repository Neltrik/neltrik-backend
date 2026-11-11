import { Company } from "../../../../domain/entities";
import { CompanyRepositorySpy } from "../../../../test-doubles";
import { ListCompaniesUseCase } from "./index";
import type { ListCompaniesInput } from "./input";

const makeInput = (): ListCompaniesInput => ({ actorTenantId: "tenant-id", limit: 20 });
const makeCompany = (id = "company-id"): Company =>
    Company.create({ id, tenantId: "tenant-id", name: "Test Company", createdAt: new Date(), slug: "" });

describe("ListCompaniesUseCase", () => {
    const makeSut = () => {
        const companyRepository = new CompanyRepositorySpy();
        const useCase = new ListCompaniesUseCase(companyRepository);
        return { useCase, companyRepository };
    };

    it("should return a list of companies successfully", async () => {
        const { useCase, companyRepository } = makeSut();
        const input = makeInput();
        const mockCompanies = [makeCompany()];
        companyRepository.findByTenant.mockResolvedValue(mockCompanies);
        const result = await useCase.execute(input);
        expect(companyRepository.findByTenant).toHaveBeenCalledTimes(1);
        expect(companyRepository.findByTenant).toHaveBeenCalledWith({
            tenantId: input.actorTenantId,
            cursor: input.cursor,
            limit: input.limit,
        });
        expect(result).toEqual({ companies: mockCompanies, meta: { nextCursor: null, hasMore: false } });
    });

    it("should return an empty list when no companies are found", async () => {
        const { useCase, companyRepository } = makeSut();
        const input = makeInput();
        companyRepository.findByTenant.mockResolvedValue([]);
        const result = await useCase.execute(input);
        expect(companyRepository.findByTenant).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ companies: [], meta: { nextCursor: null, hasMore: false } });
    });

    it("should return the first page and next cursor when there are more companies than the limit", async () => {
        const { useCase, companyRepository } = makeSut();
        const input = { ...makeInput(), limit: 2 };
        const mockCompanies = [makeCompany("company-1"), makeCompany("company-2"), makeCompany("company-3")];
        companyRepository.findByTenant.mockResolvedValue(mockCompanies);
        const result = await useCase.execute(input);
        expect(result).toEqual({
            companies: [mockCompanies[0], mockCompanies[1]],
            meta: { nextCursor: "company-2", hasMore: true },
        });
    });

    it("should propagate repository errors when finding companies", async () => {
        const { useCase, companyRepository } = makeSut();
        const error = new Error("Database error");
        companyRepository.findByTenant.mockRejectedValue(error);
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(companyRepository.findByTenant).toHaveBeenCalledTimes(1);
    });
});
