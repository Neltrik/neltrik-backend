import { CreateCompanyOhsUseCaseSpy } from "../../test-doubles";
import { CompanyApiImpl } from "./index";

describe("CompanyApiImpl", () => {
    const makeSut = () => {
        const createCompanyOhsUseCase = new CreateCompanyOhsUseCaseSpy();
        const companyApi = new CompanyApiImpl(createCompanyOhsUseCase);
        return { companyApi, createCompanyOhsUseCase };
    };

    describe("create", () => {
        it("should create a company and return its id", async () => {
            const { companyApi, createCompanyOhsUseCase } = makeSut();
            const input = { tenantId: "tenant-id", name: "Acme Corporation", slug: "acme-corporation" };
            createCompanyOhsUseCase.execute.mockResolvedValue({ id: "company-id" });
            await expect(companyApi.create(input)).resolves.toEqual({ id: "company-id" });
            expect(createCompanyOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(createCompanyOhsUseCase.execute).toHaveBeenCalledWith(input);
        });

        it("should propagate company creation errors", async () => {
            const { companyApi, createCompanyOhsUseCase } = makeSut();
            const input = { tenantId: "tenant-id", name: "Acme Corporation", slug: "acme-corporation" };
            createCompanyOhsUseCase.execute.mockRejectedValue(new Error("Failed to create company"));
            await expect(companyApi.create(input)).rejects.toThrow("Failed to create company");
            expect(createCompanyOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(createCompanyOhsUseCase.execute).toHaveBeenCalledWith(input);
        });
    });
});
