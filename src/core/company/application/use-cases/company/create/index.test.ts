import type { IdGenerator } from "@/shared/id-generator";

import { CompanySlugAlreadyExistsError } from "../../../../domain/errors";
import { CompanyRepositorySpy, TenantApiSpy } from "../../../../test-doubles";
import { CreateCompanyUseCase } from "./index";
import type { CreateCompanyInput } from "./input";

describe("CreateCompanyUseCase", () => {
    const makeSut = () => {
        const tenantApi = new TenantApiSpy();
        const generateMock = jest.fn().mockReturnValue("company-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const companyRepository = new CompanyRepositorySpy();
        const createCompanyUseCase = new CreateCompanyUseCase(tenantApi, idGenerator, companyRepository);
        return { createCompanyUseCase, tenantApi, idGenerator, companyRepository };
    };

    const makeInput = (): CreateCompanyInput => ({
        actorTenantId: "tenant-id",
        name: "Company Name",
        slug: "company-name",
    });

    describe("execute", () => {
        it("should validate the tenant, create the company and return its id", async () => {
            const { createCompanyUseCase, tenantApi, idGenerator, companyRepository } = makeSut();
            const input = makeInput();
            idGenerator.generate.mockReturnValue("company-id");
            companyRepository.findByTenantAndSlug.mockResolvedValue(null);
            await expect(createCompanyUseCase.execute(input)).resolves.toEqual({ id: "company-id" });
            expect(tenantApi.validate).toHaveBeenCalledTimes(1);
            expect(tenantApi.validate).toHaveBeenCalledWith(input.actorTenantId);
            expect(idGenerator.generate).toHaveBeenCalledTimes(1);
            expect(companyRepository.findByTenantAndSlug).toHaveBeenCalledTimes(1);
            expect(companyRepository.findByTenantAndSlug).toHaveBeenCalledWith(input.actorTenantId, input.slug);
            expect(companyRepository.create).toHaveBeenCalledTimes(1);
            const createdCompany = companyRepository.create.mock.calls[0]?.[0];
            expect(createdCompany).toBeDefined();
            if (!createdCompany) {
                throw new Error("Company was not created");
            }
            expect(createdCompany.id).toBe("company-id");
            expect(createdCompany.tenantId).toBe(input.actorTenantId);
            expect(createdCompany.name).toBe(input.name);
            expect(createdCompany.slug).toBe(input.slug);
            expect(createdCompany.createdAt).toBeInstanceOf(Date);
        });

        it("should throw CompanySlugAlreadyExistsError when the slug already exists", async () => {
            const { createCompanyUseCase, tenantApi, idGenerator, companyRepository } = makeSut();
            const input = makeInput();
            companyRepository.findByTenantAndSlug.mockResolvedValue({} as never);
            await expect(createCompanyUseCase.execute(input)).rejects.toThrow(CompanySlugAlreadyExistsError);
            expect(tenantApi.validate).toHaveBeenCalledTimes(1);
            expect(tenantApi.validate).toHaveBeenCalledWith(input.actorTenantId);
            expect(companyRepository.findByTenantAndSlug).toHaveBeenCalledTimes(1);
            expect(companyRepository.findByTenantAndSlug).toHaveBeenCalledWith(input.actorTenantId, input.slug);
            expect(idGenerator.generate).not.toHaveBeenCalled();
            expect(companyRepository.create).not.toHaveBeenCalled();
        });

        it("should propagate errors when validating the tenant", async () => {
            const { createCompanyUseCase, tenantApi, idGenerator, companyRepository } = makeSut();
            const input = makeInput();
            tenantApi.validate.mockRejectedValue(new Error("Tenant validation failed"));
            await expect(createCompanyUseCase.execute(input)).rejects.toThrow("Tenant validation failed");
            expect(tenantApi.validate).toHaveBeenCalledTimes(1);
            expect(tenantApi.validate).toHaveBeenCalledWith(input.actorTenantId);
            expect(idGenerator.generate).not.toHaveBeenCalled();
            expect(companyRepository.findByTenantAndSlug).not.toHaveBeenCalled();
            expect(companyRepository.create).not.toHaveBeenCalled();
        });

        it("should propagate errors when searching for an existing company", async () => {
            const { createCompanyUseCase, tenantApi, idGenerator, companyRepository } = makeSut();
            const input = makeInput();
            companyRepository.findByTenantAndSlug.mockRejectedValue(new Error("Failed to find company"));
            await expect(createCompanyUseCase.execute(input)).rejects.toThrow("Failed to find company");
            expect(tenantApi.validate).toHaveBeenCalledTimes(1);
            expect(companyRepository.findByTenantAndSlug).toHaveBeenCalledTimes(1);
            expect(idGenerator.generate).not.toHaveBeenCalled();
            expect(companyRepository.create).not.toHaveBeenCalled();
        });

        it("should propagate errors when creating the company", async () => {
            const { createCompanyUseCase, tenantApi, idGenerator, companyRepository } = makeSut();
            const input = makeInput();
            idGenerator.generate.mockReturnValue("company-id");
            companyRepository.findByTenantAndSlug.mockResolvedValue(null);
            companyRepository.create.mockRejectedValue(new Error("Failed to create company"));
            await expect(createCompanyUseCase.execute(input)).rejects.toThrow("Failed to create company");
            expect(tenantApi.validate).toHaveBeenCalledTimes(1);
            expect(companyRepository.findByTenantAndSlug).toHaveBeenCalledTimes(1);
            expect(idGenerator.generate).toHaveBeenCalledTimes(1);
            expect(companyRepository.create).toHaveBeenCalledTimes(1);
        });
    });
});
