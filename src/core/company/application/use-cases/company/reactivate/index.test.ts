import { Company } from "../../../../domain/entities";
import { CompanyNotFoundError } from "../../../../domain/errors";
import { CompanyRepositorySpy } from "../../../../test-doubles";
import { ReactivateCompanyUseCase } from "./index";
import type { ReactivateCompanyInput } from "./input";

describe("ReactivateCompanyUseCase", () => {
    const makeSut = () => {
        const companyRepository = new CompanyRepositorySpy();
        const validateCompanyAccessInternalUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        const reactivateCompanyUseCase = new ReactivateCompanyUseCase(
            companyRepository,
            validateCompanyAccessInternalUseCase as never,
        );
        return { reactivateCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase };
    };
    const makeInput = (): ReactivateCompanyInput => ({
        actorTenantId: "tenant-id",
        actorUserId: "user-id",
        id: "company-id",
    });
    const makeCompany = (): Company => {
        const company = Company.create({
            id: "company-id",
            tenantId: "tenant-id",
            name: "Company Name",
            slug: "company-name",
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
        });
        company.suspend();
        return company;
    };

    describe("execute", () => {
        it("should validate company access, reactivate the company and return its data", async () => {
            const { reactivateCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = makeInput();
            const company = makeCompany();
            companyRepository.findById.mockResolvedValue(company);
            const result = await reactivateCompanyUseCase.execute(input);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledTimes(1);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledWith({
                actorTenantId: input.actorTenantId,
                actorUserId: input.actorUserId,
                companyId: company.id,
            });
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
            expect(result.status).toBe("ACTIVE");
        });

        it("should throw CompanyNotFoundError when the company does not exist", async () => {
            const { reactivateCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = makeInput();
            companyRepository.findById.mockResolvedValue(null);
            await expect(reactivateCompanyUseCase.execute(input)).rejects.toThrow(CompanyNotFoundError);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(validateCompanyAccessInternalUseCase.execute).not.toHaveBeenCalled();
            expect(companyRepository.update).not.toHaveBeenCalled();
        });

        it("should propagate errors when searching for the company", async () => {
            const { reactivateCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = makeInput();
            companyRepository.findById.mockRejectedValue(new Error("Failed to find company"));
            await expect(reactivateCompanyUseCase.execute(input)).rejects.toThrow("Failed to find company");
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(validateCompanyAccessInternalUseCase.execute).not.toHaveBeenCalled();
            expect(companyRepository.update).not.toHaveBeenCalled();
        });

        it("should propagate errors when validating company access", async () => {
            const { reactivateCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = makeInput();
            const company = makeCompany();
            companyRepository.findById.mockResolvedValue(company);
            validateCompanyAccessInternalUseCase.execute.mockRejectedValue(
                new Error("Company access validation failed"),
            );
            await expect(reactivateCompanyUseCase.execute(input)).rejects.toThrow("Company access validation failed");
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledTimes(1);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledWith({
                actorTenantId: input.actorTenantId,
                actorUserId: input.actorUserId,
                companyId: company.id,
            });
            expect(companyRepository.update).not.toHaveBeenCalled();
        });

        it("should propagate errors when updating the company", async () => {
            const { reactivateCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = makeInput();
            const company = makeCompany();
            companyRepository.findById.mockResolvedValue(company);
            companyRepository.update.mockRejectedValue(new Error("Failed to reactivate company"));
            await expect(reactivateCompanyUseCase.execute(input)).rejects.toThrow("Failed to reactivate company");
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledTimes(1);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledWith({
                actorTenantId: input.actorTenantId,
                actorUserId: input.actorUserId,
                companyId: company.id,
            });
            expect(companyRepository.update).toHaveBeenCalledTimes(1);
            expect(companyRepository.update).toHaveBeenCalledWith(company);
        });
    });
});
