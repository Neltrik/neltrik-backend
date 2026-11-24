import { Company } from "../../../../domain/entities";
import { CompanyNotFoundError, CompanySlugAlreadyExistsError } from "../../../../domain/errors";
import { CompanyRepositorySpy } from "../../../../test-doubles";
import { UpdateCompanyUseCase } from "./index";
import type { UpdateCompanyInput } from "./input";

describe("UpdateCompanyUseCase", () => {
    const makeSut = () => {
        const companyRepository = new CompanyRepositorySpy();
        const validateCompanyAccessInternalUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        const updateCompanyUseCase = new UpdateCompanyUseCase(
            companyRepository,
            validateCompanyAccessInternalUseCase as never,
        );
        return { updateCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase };
    };
    const makeInput = (): UpdateCompanyInput => ({
        actorTenantId: "tenant-id",
        actorUserId: "user-id",
        id: "company-id",
        name: "Updated Company",
        slug: "updated-company",
    });

    const makeCompany = (): Company =>
        Company.create({
            id: "company-id",
            tenantId: "tenant-id",
            name: "Company Name",
            slug: "company-name",
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
        });

    describe("execute", () => {
        it("should update the company and return its data", async () => {
            const { updateCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = makeInput();
            const company = makeCompany();
            companyRepository.findById.mockResolvedValue(company);
            companyRepository.findBySlug.mockResolvedValue(null);
            const result = await updateCompanyUseCase.execute(input);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledTimes(1);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledWith({
                actorTenantId: input.actorTenantId,
                actorUserId: input.actorUserId,
                companyId: company.id,
            });
            expect(companyRepository.findBySlug).toHaveBeenCalledTimes(1);
            expect(companyRepository.findBySlug).toHaveBeenCalledWith(input.slug);
            expect(companyRepository.update).toHaveBeenCalledTimes(1);
            expect(companyRepository.update).toHaveBeenCalledWith(company);
            expect(result).toEqual({
                id: company.id,
                tenantId: company.tenantId,
                name: input.name,
                slug: input.slug,
                status: company.status,
                createdAt: company.createdAt,
                updatedAt: company.updatedAt,
            });
        });

        it("should update only the company name when slug is not provided", async () => {
            const { updateCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = {
                actorTenantId: "tenant-id",
                actorUserId: "user-id",
                id: "company-id",
                name: "Updated Company",
            };
            const company = makeCompany();
            companyRepository.findById.mockResolvedValue(company);
            const result = await updateCompanyUseCase.execute(input);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledTimes(1);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledWith({
                actorTenantId: input.actorTenantId,
                actorUserId: input.actorUserId,
                companyId: company.id,
            });
            expect(companyRepository.findBySlug).not.toHaveBeenCalled();
            expect(companyRepository.update).toHaveBeenCalledTimes(1);
            expect(companyRepository.update).toHaveBeenCalledWith(company);
            expect(company.name).toBe(input.name);
            expect(company.slug).toBe("company-name");
            expect(result.name).toBe(input.name);
            expect(result.slug).toBe("company-name");
        });

        it("should update only the company slug when name is not provided", async () => {
            const { updateCompanyUseCase, companyRepository } = makeSut();
            const input = {
                actorTenantId: "tenant-id",
                actorUserId: "user-id",
                id: "company-id",
                slug: "updated-company",
            };
            const company = makeCompany();
            companyRepository.findById.mockResolvedValue(company);
            companyRepository.findBySlug.mockResolvedValue(null);
            const result = await updateCompanyUseCase.execute(input);
            expect(companyRepository.findBySlug).toHaveBeenCalledTimes(1);
            expect(companyRepository.findBySlug).toHaveBeenCalledWith(input.slug);
            expect(companyRepository.update).toHaveBeenCalledTimes(1);
            expect(companyRepository.update).toHaveBeenCalledWith(company);
            expect(company.name).toBe("Company Name");
            expect(company.slug).toBe(input.slug);
            expect(result.name).toBe("Company Name");
            expect(result.slug).toBe(input.slug);
        });

        it("should update the company without searching for an existing slug when the slug is unchanged", async () => {
            const { updateCompanyUseCase, companyRepository } = makeSut();
            const input = {
                actorTenantId: "tenant-id",
                actorUserId: "user-id",
                id: "company-id",
                slug: "company-name",
            };
            const company = makeCompany();
            companyRepository.findById.mockResolvedValue(company);
            const result = await updateCompanyUseCase.execute(input);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(companyRepository.findBySlug).not.toHaveBeenCalled();
            expect(companyRepository.update).toHaveBeenCalledTimes(1);
            expect(companyRepository.update).toHaveBeenCalledWith(company);
            expect(result.slug).toBe(company.slug);
        });

        it("should throw CompanyNotFoundError when the company does not exist", async () => {
            const { updateCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = makeInput();
            companyRepository.findById.mockResolvedValue(null);
            await expect(updateCompanyUseCase.execute(input)).rejects.toThrow(CompanyNotFoundError);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(validateCompanyAccessInternalUseCase.execute).not.toHaveBeenCalled();
            expect(companyRepository.findBySlug).not.toHaveBeenCalled();
            expect(companyRepository.update).not.toHaveBeenCalled();
        });

        it("should throw CompanySlugAlreadyExistsError when the slug already exists", async () => {
            const { updateCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = makeInput();
            const company = makeCompany();
            companyRepository.findById.mockResolvedValue(company);
            companyRepository.findBySlug.mockResolvedValue(makeCompany());
            await expect(updateCompanyUseCase.execute(input)).rejects.toThrow(CompanySlugAlreadyExistsError);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledTimes(1);
            expect(companyRepository.findBySlug).toHaveBeenCalledTimes(1);
            expect(companyRepository.findBySlug).toHaveBeenCalledWith(input.slug);
            expect(companyRepository.update).not.toHaveBeenCalled();
        });

        it("should propagate errors when searching for the company", async () => {
            const { updateCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = makeInput();
            companyRepository.findById.mockRejectedValue(new Error("Failed to find company"));
            await expect(updateCompanyUseCase.execute(input)).rejects.toThrow("Failed to find company");
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(validateCompanyAccessInternalUseCase.execute).not.toHaveBeenCalled();
            expect(companyRepository.findBySlug).not.toHaveBeenCalled();
            expect(companyRepository.update).not.toHaveBeenCalled();
        });

        it("should propagate errors when validating company access", async () => {
            const { updateCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = makeInput();
            const company = makeCompany();
            companyRepository.findById.mockResolvedValue(company);
            validateCompanyAccessInternalUseCase.execute.mockRejectedValue(
                new Error("Company access validation failed"),
            );
            await expect(updateCompanyUseCase.execute(input)).rejects.toThrow("Company access validation failed");
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledTimes(1);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledWith({
                actorTenantId: input.actorTenantId,
                actorUserId: input.actorUserId,
                companyId: company.id,
            });
            expect(companyRepository.findBySlug).not.toHaveBeenCalled();
            expect(companyRepository.update).not.toHaveBeenCalled();
        });

        it("should propagate errors when searching for an existing slug", async () => {
            const { updateCompanyUseCase, companyRepository } = makeSut();
            const input = makeInput();
            companyRepository.findById.mockResolvedValue(makeCompany());
            companyRepository.findBySlug.mockRejectedValue(new Error("Failed to find company by slug"));
            await expect(updateCompanyUseCase.execute(input)).rejects.toThrow("Failed to find company by slug");
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findBySlug).toHaveBeenCalledTimes(1);
            expect(companyRepository.findBySlug).toHaveBeenCalledWith(input.slug);
            expect(companyRepository.update).not.toHaveBeenCalled();
        });

        it("should propagate errors when updating the company", async () => {
            const { updateCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = makeInput();
            const company = makeCompany();
            companyRepository.findById.mockResolvedValue(company);
            companyRepository.findBySlug.mockResolvedValue(null);
            companyRepository.update.mockRejectedValue(new Error("Failed to update company"));
            await expect(updateCompanyUseCase.execute(input)).rejects.toThrow("Failed to update company");
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findBySlug).toHaveBeenCalledTimes(1);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledTimes(1);
            expect(companyRepository.update).toHaveBeenCalledTimes(1);
            expect(companyRepository.update).toHaveBeenCalledWith(company);
        });
    });
});
