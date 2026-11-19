import { type TenantApi } from "@/core/tenant/api";
import { ForbiddenError } from "@/shared/errors";

import type { Membership } from "../../../../domain/entities";
import { MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepositorySpy } from "../../../../test-doubles";
import { GetMembershipUseCase } from "./index";
import type { GetMembershipInput } from "./input";

describe("GetMembershipUseCase", () => {
    const makeSut = () => {
        const tenantApi: jest.Mocked<TenantApi> = {
            isPlatformTenant: jest.fn().mockResolvedValue(false),
        } as never;
        const membershipRepository = new MembershipRepositorySpy();
        const getMembershipUseCase = new GetMembershipUseCase(tenantApi, membershipRepository);
        return { getMembershipUseCase, tenantApi, membershipRepository };
    };
    const makeInput = (): GetMembershipInput => ({
        membershipId: "membership-id",
        actorTenantId: "actor-tenant-id",
        actorUserId: "actor-user-id",
    });
    const mockMembership = () =>
        ({
            id: "membership-id",
            tenantId: "tenant-id",
            companyId: "company-id",
            userId: "target-user-id",
        }) as Membership;

    describe("execute", () => {
        it("should return the membership when the actor has an active membership in the company", async () => {
            const { getMembershipUseCase, tenantApi, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership);
            membershipRepository.findActiveByUserAndCompany.mockResolvedValue({} as never);
            await expect(getMembershipUseCase.execute(input)).resolves.toEqual({
                membership,
            });
            expect(membershipRepository.findById).toHaveBeenCalledWith(input.membershipId);
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledWith(
                input.actorUserId,
                membership.companyId,
            );
        });

        it("should throw MembershipNotFoundError when the membership does not exist", async () => {
            const { getMembershipUseCase, tenantApi, membershipRepository } = makeSut();
            membershipRepository.findById.mockResolvedValue(null);
            await expect(getMembershipUseCase.execute(makeInput())).rejects.toThrow(MembershipNotFoundError);
            expect(tenantApi.isPlatformTenant).not.toHaveBeenCalled();
            expect(membershipRepository.findActiveByUserAndCompany).not.toHaveBeenCalled();
        });

        it("should return the membership when the actor belongs to a platform tenant", async () => {
            const { getMembershipUseCase, tenantApi, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership);
            tenantApi.isPlatformTenant.mockResolvedValue(true);
            await expect(getMembershipUseCase.execute(input)).resolves.toEqual({ membership });
            expect(membershipRepository.findActiveByUserAndCompany).not.toHaveBeenCalled();
        });

        it("should return the membership when the actor is the membership owner", async () => {
            const { getMembershipUseCase, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = { ...mockMembership(), userId: input.actorUserId } as Membership;
            membershipRepository.findById.mockResolvedValue(membership);
            await expect(getMembershipUseCase.execute(input)).resolves.toEqual({ membership });
            expect(membershipRepository.findById).toHaveBeenCalledWith(input.membershipId);
            expect(membershipRepository.findActiveByUserAndCompany).not.toHaveBeenCalled();
        });

        it("should throw ForbiddenError when the actor has no active membership in the company", async () => {
            const { getMembershipUseCase, membershipRepository } = makeSut();
            membershipRepository.findById.mockResolvedValue(mockMembership());
            membershipRepository.findActiveByUserAndCompany.mockResolvedValue(null);
            await expect(getMembershipUseCase.execute(makeInput())).rejects.toThrow(ForbiddenError);
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledTimes(1);
        });

        it.each([
            ["finding the membership", "findMembership"],
            ["checking the platform tenant", "platformTenant"],
            ["finding the actor membership", "findActorMembership"],
        ])("should propagate errors when %s fails", async (_, operation) => {
            const { getMembershipUseCase, tenantApi, membershipRepository } = makeSut();
            const error = new Error("Operation failed");
            membershipRepository.findById.mockResolvedValue(mockMembership());
            if (operation === "findMembership") {
                membershipRepository.findById.mockRejectedValue(error);
            } else if (operation === "platformTenant") {
                tenantApi.isPlatformTenant.mockRejectedValue(error);
            } else if (operation === "findActorMembership") {
                membershipRepository.findActiveByUserAndCompany.mockRejectedValue(error);
            }
            await expect(getMembershipUseCase.execute(makeInput())).rejects.toThrow(error);
        });
    });
});
