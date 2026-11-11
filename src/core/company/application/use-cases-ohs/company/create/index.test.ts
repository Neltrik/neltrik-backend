import type { IdGenerator } from "@/shared/id-generator";

import { CompanyRepositorySpy } from "../../../../test-doubles";
import { CreateCompanyOhsUseCase } from "./index";
import type { CreateCompanyOhsInput } from "./input";

describe("CreateCompanyOhsUseCase", () => {
    const makeSut = () => {
        const generateMock = jest.fn().mockReturnValue("company-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const companyRepository = new CompanyRepositorySpy();
        const createCompanyOhsUseCase = new CreateCompanyOhsUseCase(idGenerator, companyRepository);
        return { createCompanyOhsUseCase, idGenerator, companyRepository };
    };

    const makeInput = (): CreateCompanyOhsInput => ({
        tenantId: "tenant-id",
        name: "Company Name",
        slug: "company-name",
    });

    describe("execute", () => {
        it("should create the company and return its id", async () => {
            const { createCompanyOhsUseCase, idGenerator, companyRepository } = makeSut();
            const input = makeInput();
            idGenerator.generate.mockReturnValue("company-id");
            await expect(createCompanyOhsUseCase.execute(input)).resolves.toEqual({ id: "company-id" });
            expect(idGenerator.generate).toHaveBeenCalledTimes(1);
            expect(companyRepository.create).toHaveBeenCalledTimes(1);
            const createdCompany = companyRepository.create.mock.calls[0]?.[0];
            expect(createdCompany).toBeDefined();
            if (!createdCompany) {
                throw new Error("Company was not created");
            }
            expect(createdCompany.id).toBe("company-id");
            expect(createdCompany.tenantId).toBe(input.tenantId);
            expect(createdCompany.name).toBe(input.name);
            expect(createdCompany.slug).toBe(input.slug);
            expect(createdCompany.createdAt).toBeInstanceOf(Date);
        });

        it("should create the company with the generated id", async () => {
            const { createCompanyOhsUseCase, idGenerator, companyRepository } = makeSut();
            idGenerator.generate.mockReturnValue("generated-company-id");
            await createCompanyOhsUseCase.execute(makeInput());
            expect(idGenerator.generate).toHaveBeenCalledTimes(1);
            const createdCompany = companyRepository.create.mock.calls[0]?.[0];
            expect(createdCompany).toBeDefined();
            if (!createdCompany) {
                throw new Error("Company was not created");
            }
            expect(createdCompany.id).toBe("generated-company-id");
        });

        it("should create the company with the normalized slug", async () => {
            const { createCompanyOhsUseCase, idGenerator, companyRepository } = makeSut();
            const input = makeInput();
            input.slug = "Company-Name";
            idGenerator.generate.mockReturnValue("company-id");
            await createCompanyOhsUseCase.execute(input);
            const createdCompany = companyRepository.create.mock.calls[0]?.[0];
            expect(createdCompany).toBeDefined();
            if (!createdCompany) {
                throw new Error("Company was not created");
            }
            expect(createdCompany.slug).toBe("company-name");
        });

        it("should propagate errors when generating the company id", async () => {
            const { createCompanyOhsUseCase, idGenerator, companyRepository } = makeSut();
            idGenerator.generate.mockImplementation(() => {
                throw new Error("Failed to generate company id");
            });
            await expect(createCompanyOhsUseCase.execute(makeInput())).rejects.toThrow("Failed to generate company id");
            expect(idGenerator.generate).toHaveBeenCalledTimes(1);
            expect(companyRepository.create).not.toHaveBeenCalled();
        });

        it("should propagate errors when creating the company", async () => {
            const { createCompanyOhsUseCase, idGenerator, companyRepository } = makeSut();
            idGenerator.generate.mockReturnValue("company-id");
            companyRepository.create.mockRejectedValue(new Error("Failed to create company"));
            await expect(createCompanyOhsUseCase.execute(makeInput())).rejects.toThrow("Failed to create company");
            expect(idGenerator.generate).toHaveBeenCalledTimes(1);
            expect(companyRepository.create).toHaveBeenCalledTimes(1);
        });
    });
});
