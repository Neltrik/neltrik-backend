import { type MembershipRepository } from "../../../domain/interfaces";
import { MembershipCheckerProvider } from "./index";

describe("MembershipCheckerProvider", () => {
    const makeSut = () => {
        const findActiveByUserAndCompanyMock = jest.fn();
        const membershipRepository = {
            findActiveByUserAndCompany: findActiveByUserAndCompanyMock,
        } as unknown as MembershipRepository;
        const provider = new MembershipCheckerProvider(membershipRepository);
        return { provider, findActiveByUserAndCompanyMock };
    };

    it("should return true when user has an active membership", async () => {
        const { provider, findActiveByUserAndCompanyMock } = makeSut();
        findActiveByUserAndCompanyMock.mockResolvedValue({ id: "membership-id" });
        const result = await provider.hasActiveMembership("user-id", "company-id");
        expect(findActiveByUserAndCompanyMock).toHaveBeenCalledTimes(1);
        expect(findActiveByUserAndCompanyMock).toHaveBeenCalledWith("user-id", "company-id");
        expect(result).toBe(true);
    });

    it("should return false when user does not have an active membership", async () => {
        const { provider, findActiveByUserAndCompanyMock } = makeSut();
        findActiveByUserAndCompanyMock.mockResolvedValue(null);
        const result = await provider.hasActiveMembership("user-id", "company-id");
        expect(findActiveByUserAndCompanyMock).toHaveBeenCalledTimes(1);
        expect(findActiveByUserAndCompanyMock).toHaveBeenCalledWith("user-id", "company-id");
        expect(result).toBe(false);
    });

    it("should propagate repository errors", async () => {
        const { provider, findActiveByUserAndCompanyMock } = makeSut();
        findActiveByUserAndCompanyMock.mockRejectedValue(new Error("Repository error"));
        await expect(provider.hasActiveMembership("user-id", "company-id")).rejects.toThrow("Repository error");
        expect(findActiveByUserAndCompanyMock).toHaveBeenCalledTimes(1);
        expect(findActiveByUserAndCompanyMock).toHaveBeenCalledWith("user-id", "company-id");
    });
});
