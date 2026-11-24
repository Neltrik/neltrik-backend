import { Company } from "../../../../domain/entities";
import { CompanyNotFoundError } from "../../../../domain/errors";
import { CompanyRepositorySpy } from "../../../../test-doubles";
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
        const companyRepository = new CompanyRepositorySpy();
        companyRepository.findById.mockResolvedValue(makeCompany());
        const validateCompanyAccessInternalUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        const getCompanyUseCase = new GetCompanyUseCase(
            companyRepository,
            validateCompanyAccessInternalUseCase as never,
        );
        return { getCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase };
    };
    const makeInput = (): GetCompanyInput => ({ id: "company-id", actorTenantId: "tenant-id", actorUserId: "user-id" });

    describe("execute", () => {
        it("should return company details successfully", async () => {
            const { getCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = makeInput();
            const company = makeCompany();
            companyRepository.findById.mockResolvedValue(company);
            const result = await getCompanyUseCase.execute(input);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledTimes(1);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledWith({
                actorTenantId: input.actorTenantId,
                actorUserId: input.actorUserId,
                companyId: company.id,
            });
            expect(result.id).toBe(company.id);
            expect(result.tenantId).toBe(company.tenantId);
            expect(result.name).toBe(company.name);
            expect(result.slug).toBe(company.slug);
            expect(result.status).toBe(company.status);
            expect(result.createdAt).toBe(company.createdAt);
            expect(result.updatedAt).toBe(company.updatedAt);
        });

        it("should return company details when the actor belongs to another tenant", async () => {
            const { getCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = makeInput();
            const company = Company.create({
                id: "company-id",
                tenantId: "another-tenant-id",
                name: "Company Name",
                slug: "company-name",
                createdAt: new Date("2025-01-01T00:00:00.000Z"),
            });
            companyRepository.findById.mockResolvedValue(company);
            const result = await getCompanyUseCase.execute(input);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledTimes(1);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledWith({
                actorTenantId: input.actorTenantId,
                actorUserId: input.actorUserId,
                companyId: company.id,
            });
            expect(result.id).toBe(company.id);
            expect(result.tenantId).toBe(company.tenantId);
        });

        it("should throw CompanyNotFoundError when the company does not exist", async () => {
            const { getCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = makeInput();
            companyRepository.findById.mockResolvedValue(null);
            await expect(getCompanyUseCase.execute(input)).rejects.toThrow(CompanyNotFoundError);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(validateCompanyAccessInternalUseCase.execute).not.toHaveBeenCalled();
        });

        it("should propagate errors when searching for the company", async () => {
            const { getCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = makeInput();
            companyRepository.findById.mockRejectedValue(new Error("Failed to find company"));
            await expect(getCompanyUseCase.execute(input)).rejects.toThrow("Failed to find company");
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(validateCompanyAccessInternalUseCase.execute).not.toHaveBeenCalled();
        });

        it("should propagate errors when validating company access", async () => {
            const { getCompanyUseCase, companyRepository, validateCompanyAccessInternalUseCase } = makeSut();
            const input = makeInput();
            const company = makeCompany();
            companyRepository.findById.mockResolvedValue(company);
            validateCompanyAccessInternalUseCase.execute.mockRejectedValue(
                new Error("Company access validation failed"),
            );
            await expect(getCompanyUseCase.execute(input)).rejects.toThrow("Company access validation failed");
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.id);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledTimes(1);
            expect(validateCompanyAccessInternalUseCase.execute).toHaveBeenCalledWith({
                actorTenantId: input.actorTenantId,
                actorUserId: input.actorUserId,
                companyId: company.id,
            });
        });
    });
});
