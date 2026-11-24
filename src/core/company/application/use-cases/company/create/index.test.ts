import type { IdGenerator } from "@/shared/id-generator";

import { CompanySlugAlreadyExistsError } from "../../../../domain/errors";
import { CompanyRepositorySpy } from "../../../../test-doubles";
import { CreateCompanyUseCase } from "./index";
import type { CreateCompanyInput } from "./input";

describe("CreateCompanyUseCase", () => {
    const makeSut = () => {
        const generateMock = jest.fn().mockReturnValue("company-id");
        const idGenerator = { generate: generateMock } satisfies IdGenerator;
        const companyRepository = new CompanyRepositorySpy();
        const createCompanyUseCase = new CreateCompanyUseCase(idGenerator, companyRepository);
        return { createCompanyUseCase, idGenerator, companyRepository };
    };

    const makeInput = (): CreateCompanyInput => ({
        actorTenantId: "tenant-id",
        name: "Company Name",
        slug: "company-name",
    });

    describe("execute", () => {
        it("should create the company and return its id", async () => {
            const { createCompanyUseCase, idGenerator, companyRepository } = makeSut();
            const input = makeInput();
            idGenerator.generate.mockReturnValue("company-id");
            companyRepository.findBySlug.mockResolvedValue(null);
            await expect(createCompanyUseCase.execute(input)).resolves.toEqual({ id: "company-id" });
            expect(companyRepository.findBySlug).toHaveBeenCalledTimes(1);
            expect(companyRepository.findBySlug).toHaveBeenCalledWith(input.slug);
            expect(idGenerator.generate).toHaveBeenCalledTimes(1);
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
            const { createCompanyUseCase, idGenerator, companyRepository } = makeSut();
            const input = makeInput();
            companyRepository.findBySlug.mockResolvedValue({} as never);
            await expect(createCompanyUseCase.execute(input)).rejects.toThrow(CompanySlugAlreadyExistsError);
            expect(companyRepository.findBySlug).toHaveBeenCalledTimes(1);
            expect(companyRepository.findBySlug).toHaveBeenCalledWith(input.slug);
            expect(idGenerator.generate).not.toHaveBeenCalled();
            expect(companyRepository.create).not.toHaveBeenCalled();
        });

        it("should propagate errors when searching for an existing company", async () => {
            const { createCompanyUseCase, idGenerator, companyRepository } = makeSut();
            const input = makeInput();
            companyRepository.findBySlug.mockRejectedValue(new Error("Failed to find company"));
            await expect(createCompanyUseCase.execute(input)).rejects.toThrow("Failed to find company");
            expect(companyRepository.findBySlug).toHaveBeenCalledTimes(1);
            expect(companyRepository.findBySlug).toHaveBeenCalledWith(input.slug);
            expect(idGenerator.generate).not.toHaveBeenCalled();
            expect(companyRepository.create).not.toHaveBeenCalled();
        });

        it("should propagate errors when creating the company", async () => {
            const { createCompanyUseCase, idGenerator, companyRepository } = makeSut();
            const input = makeInput();
            companyRepository.findBySlug.mockResolvedValue(null);
            companyRepository.create.mockRejectedValue(new Error("Failed to create company"));
            await expect(createCompanyUseCase.execute(input)).rejects.toThrow("Failed to create company");
            expect(companyRepository.findBySlug).toHaveBeenCalledTimes(1);
            expect(idGenerator.generate).toHaveBeenCalledTimes(1);
            expect(companyRepository.create).toHaveBeenCalledTimes(1);
        });
    });
});
