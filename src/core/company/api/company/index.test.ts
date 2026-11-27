import { CreateCompanyOhsUseCaseSpy, DeleteCompanyOhsUseCaseSpy } from "../../test-doubles";
import { CompanyApiImpl } from "./impl";

describe("CompanyApiImpl", () => {
    const makeSut = () => {
        const createCompanyOhsUseCase = new CreateCompanyOhsUseCaseSpy();
        const deleteCompanyOhsUseCase = new DeleteCompanyOhsUseCaseSpy();
        const companyApi = new CompanyApiImpl(createCompanyOhsUseCase, deleteCompanyOhsUseCase);
        return { companyApi, createCompanyOhsUseCase, deleteCompanyOhsUseCase };
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

    describe("delete", () => {
        it("should delete a company", async () => {
            const { companyApi, deleteCompanyOhsUseCase } = makeSut();
            const id = "company-id";
            deleteCompanyOhsUseCase.execute.mockResolvedValue(undefined);
            await expect(companyApi.delete(id)).resolves.toBeUndefined();
            expect(deleteCompanyOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(deleteCompanyOhsUseCase.execute).toHaveBeenCalledWith(id);
        });

        it("should propagate company deletion errors", async () => {
            const { companyApi, deleteCompanyOhsUseCase } = makeSut();
            const id = "company-id";
            deleteCompanyOhsUseCase.execute.mockRejectedValue(new Error("Failed to delete company"));
            await expect(companyApi.delete(id)).rejects.toThrow("Failed to delete company");
            expect(deleteCompanyOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(deleteCompanyOhsUseCase.execute).toHaveBeenCalledWith(id);
        });
    });
});
