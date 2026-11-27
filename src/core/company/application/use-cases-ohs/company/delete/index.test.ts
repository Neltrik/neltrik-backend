import { CompanyNotFoundError } from "../../../../domain/errors";
import { CompanyRepositorySpy } from "../../../../test-doubles";
import { DeleteCompanyOhsUseCase } from "./index";

describe("DeleteCompanyOhsUseCase", () => {
    const makeSut = () => {
        const companyRepository = new CompanyRepositorySpy();
        const deleteCompanyOhsUseCase = new DeleteCompanyOhsUseCase(companyRepository);
        return { deleteCompanyOhsUseCase, companyRepository };
    };

    describe("execute", () => {
        it("should delete a company successfully", async () => {
            const { deleteCompanyOhsUseCase, companyRepository } = makeSut();
            const id = "company-id";
            companyRepository.findById.mockResolvedValue({ id } as never);
            companyRepository.delete.mockResolvedValue(undefined);
            await expect(deleteCompanyOhsUseCase.execute(id)).resolves.toBeUndefined();
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(id);
            expect(companyRepository.delete).toHaveBeenCalledTimes(1);
            expect(companyRepository.delete).toHaveBeenCalledWith(id);
        });

        it("should throw CompanyNotFoundError when company does not exist", async () => {
            const { deleteCompanyOhsUseCase, companyRepository } = makeSut();
            const id = "company-id";
            companyRepository.findById.mockResolvedValue(null);
            await expect(deleteCompanyOhsUseCase.execute(id)).rejects.toThrow(CompanyNotFoundError);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(id);
            expect(companyRepository.delete).not.toHaveBeenCalled();
        });

        it("should propagate company lookup errors", async () => {
            const { deleteCompanyOhsUseCase, companyRepository } = makeSut();
            const id = "company-id";
            companyRepository.findById.mockRejectedValue(new Error("Failed to find company"));
            await expect(deleteCompanyOhsUseCase.execute(id)).rejects.toThrow("Failed to find company");
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(id);
            expect(companyRepository.delete).not.toHaveBeenCalled();
        });

        it("should propagate company deletion errors", async () => {
            const { deleteCompanyOhsUseCase, companyRepository } = makeSut();
            const id = "company-id";
            companyRepository.findById.mockResolvedValue({ id } as never);
            companyRepository.delete.mockRejectedValue(new Error("Failed to delete company"));
            await expect(deleteCompanyOhsUseCase.execute(id)).rejects.toThrow("Failed to delete company");
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(id);
            expect(companyRepository.delete).toHaveBeenCalledTimes(1);
            expect(companyRepository.delete).toHaveBeenCalledWith(id);
        });
    });
});
