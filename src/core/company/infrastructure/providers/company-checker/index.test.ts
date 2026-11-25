import { type CompanyRepository } from "../../../domain/interfaces";
import { CompanyCheckerProvider } from "./index";

describe("CompanyCheckerProvider", () => {
    const makeSut = () => {
        const findByIdMock = jest.fn();
        const companyRepository = {
            findById: findByIdMock,
        } as unknown as CompanyRepository;
        const provider = new CompanyCheckerProvider(companyRepository);
        return { provider, findByIdMock };
    };

    it("should return true when company exists and is active", async () => {
        const { provider, findByIdMock } = makeSut();
        const isActiveMock = jest.fn().mockReturnValue(true);
        findByIdMock.mockResolvedValue({ id: "company-id", isActive: isActiveMock });
        const result = await provider.isActive("company-id");
        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(findByIdMock).toHaveBeenCalledWith("company-id");
        expect(isActiveMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(true);
    });

    it("should return false when company exists and is inactive", async () => {
        const { provider, findByIdMock } = makeSut();
        const isActiveMock = jest.fn().mockReturnValue(false);
        findByIdMock.mockResolvedValue({ id: "company-id", isActive: isActiveMock });
        const result = await provider.isActive("company-id");
        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(findByIdMock).toHaveBeenCalledWith("company-id");
        expect(isActiveMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(false);
    });

    it("should return false when company does not exist", async () => {
        const { provider, findByIdMock } = makeSut();
        findByIdMock.mockResolvedValue(null);
        const result = await provider.isActive("company-id");
        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(findByIdMock).toHaveBeenCalledWith("company-id");
        expect(result).toBe(false);
    });

    it("should propagate repository errors", async () => {
        const { provider, findByIdMock } = makeSut();
        findByIdMock.mockRejectedValue(new Error("Repository error"));
        await expect(provider.isActive("company-id")).rejects.toThrow("Repository error");
        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(findByIdMock).toHaveBeenCalledWith("company-id");
    });
});
