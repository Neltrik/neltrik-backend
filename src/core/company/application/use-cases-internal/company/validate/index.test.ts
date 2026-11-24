import { CompanyNotFoundError } from "../../../../domain/errors";
import { MembershipRepositorySpy, TenantApiSpy } from "../../../../test-doubles";
import { ValidateCompanyAccessInternalUseCase } from "./index";
import type { ValidateCompanyAccessInput } from "./input";

const makeInput = (): ValidateCompanyAccessInput => ({
    actorTenantId: "tenant-id",
    actorUserId: "user-id",
    companyId: "company-id",
});

describe("ValidateCompanyAccessInternalUseCase", () => {
    const makeSut = () => {
        const tenantApi = new TenantApiSpy();
        const membershipRepository = new MembershipRepositorySpy();
        const useCase = new ValidateCompanyAccessInternalUseCase(tenantApi, membershipRepository);
        return { useCase, tenantApi, membershipRepository };
    };

    describe("execute", () => {
        it("should return successfully when actor is a platform admin", async () => {
            const { useCase, tenantApi, membershipRepository } = makeSut();
            const input = makeInput();
            tenantApi.isPlatformTenant.mockResolvedValue(true);
            await expect(useCase.execute(input)).resolves.toBeUndefined();
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
            expect(membershipRepository.findActiveByUserAndCompany).not.toHaveBeenCalled();
        });

        it("should return successfully when actor has an active membership in the company", async () => {
            const { useCase, tenantApi, membershipRepository } = makeSut();
            const input = makeInput();
            tenantApi.isPlatformTenant.mockResolvedValue(false);
            membershipRepository.findActiveByUserAndCompany.mockResolvedValue({} as never);
            await expect(useCase.execute(input)).resolves.toBeUndefined();
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledTimes(1);
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledWith(
                input.actorUserId,
                input.companyId,
            );
        });

        it("should throw CompanyNotFoundError when actor does not have an active membership in the company", async () => {
            const { useCase, tenantApi, membershipRepository } = makeSut();
            const input = makeInput();
            tenantApi.isPlatformTenant.mockResolvedValue(false);
            membershipRepository.findActiveByUserAndCompany.mockResolvedValue(null);
            await expect(useCase.execute(input)).rejects.toThrow(CompanyNotFoundError);
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledTimes(1);
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledWith(
                input.actorUserId,
                input.companyId,
            );
        });

        it("should propagate tenant API errors", async () => {
            const { useCase, tenantApi, membershipRepository } = makeSut();
            const error = new Error("Tenant API error");
            tenantApi.isPlatformTenant.mockRejectedValue(error);
            await expect(useCase.execute(makeInput())).rejects.toThrow("Tenant API error");
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
            expect(membershipRepository.findActiveByUserAndCompany).not.toHaveBeenCalled();
        });

        it("should propagate repository errors when finding active membership", async () => {
            const { useCase, tenantApi, membershipRepository } = makeSut();
            const error = new Error("Database error");
            const input = makeInput();
            tenantApi.isPlatformTenant.mockResolvedValue(false);
            membershipRepository.findActiveByUserAndCompany.mockRejectedValue(error);
            await expect(useCase.execute(input)).rejects.toThrow("Database error");
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledTimes(1);
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledWith(
                input.actorUserId,
                input.companyId,
            );
        });
    });
});
