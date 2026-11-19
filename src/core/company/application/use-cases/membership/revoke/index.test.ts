import { type TenantApi } from "@/core/tenant/api";
import { ForbiddenError } from "@/shared/errors";

import type { Membership } from "../../../../domain/entities";
import { MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepositorySpy } from "../../../../test-doubles";
import { RevokeMemberUseCase } from "./index";
import type { RevokeMemberInput } from "./input";

describe("RevokeMemberUseCase", () => {
    const makeSut = () => {
        const tenantApi: jest.Mocked<TenantApi> = {
            isPlatformTenant: jest.fn().mockResolvedValue(false),
        } as never;
        const membershipRepository = new MembershipRepositorySpy();
        const revokeMemberUseCase = new RevokeMemberUseCase(tenantApi, membershipRepository);
        return { revokeMemberUseCase, tenantApi, membershipRepository };
    };

    const makeInput = (): RevokeMemberInput => ({
        membershipId: "membership-id",
        actorTenantId: "actor-tenant-id",
        actorUserId: "actor-user-id",
    });

    const mockMembership = () => {
        const revoke = jest.fn();
        const membership = {
            id: "membership-id",
            tenantId: "tenant-id",
            companyId: "company-id",
            userId: "target-user-id",
            revoke,
        } as unknown as Membership;
        return membership;
    };

    describe("execute", () => {
        it("should revoke the membership and return its id", async () => {
            const { revokeMemberUseCase, tenantApi, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership);
            membershipRepository.findActiveByUserAndCompany.mockResolvedValue({} as never);
            await expect(revokeMemberUseCase.execute(input)).resolves.toEqual({
                id: "membership-id",
            });
            expect(membershipRepository.findById).toHaveBeenCalledWith(input.membershipId);
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledWith(
                input.actorUserId,
                "company-id",
            );
            expect(membership.revoke).toHaveBeenCalledTimes(1);
            expect(membershipRepository.update).toHaveBeenCalledWith(membership);
        });

        it("should throw MembershipNotFoundError when the membership does not exist", async () => {
            const { revokeMemberUseCase, tenantApi, membershipRepository } = makeSut();
            membershipRepository.findById.mockResolvedValue(null);
            await expect(revokeMemberUseCase.execute(makeInput())).rejects.toThrow(MembershipNotFoundError);
            expect(tenantApi.isPlatformTenant).not.toHaveBeenCalled();
            expect(membershipRepository.findActiveByUserAndCompany).not.toHaveBeenCalled();
            expect(membershipRepository.update).not.toHaveBeenCalled();
        });

        it("should allow revoking the membership when the actor belongs to a platform tenant", async () => {
            const { revokeMemberUseCase, tenantApi, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership);
            tenantApi.isPlatformTenant.mockResolvedValue(true);
            await expect(revokeMemberUseCase.execute(input)).resolves.toEqual({
                id: "membership-id",
            });
            expect(membershipRepository.findActiveByUserAndCompany).not.toHaveBeenCalled();
            expect(membership.revoke).toHaveBeenCalledTimes(1);
            expect(membershipRepository.update).toHaveBeenCalledWith(membership);
        });

        it("should throw ForbiddenError when the actor has no active membership in the company", async () => {
            const { revokeMemberUseCase, membershipRepository } = makeSut();
            membershipRepository.findById.mockResolvedValue(mockMembership());
            membershipRepository.findActiveByUserAndCompany.mockResolvedValue(null);
            await expect(revokeMemberUseCase.execute(makeInput())).rejects.toThrow(ForbiddenError);
            expect(membershipRepository.update).not.toHaveBeenCalled();
        });

        it("should throw ForbiddenError when the actor tries to revoke their own membership", async () => {
            const { revokeMemberUseCase, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = { ...mockMembership(), userId: input.actorUserId } as Membership;
            membershipRepository.findById.mockResolvedValue(membership);
            membershipRepository.findActiveByUserAndCompany.mockResolvedValue({} as never);
            await expect(revokeMemberUseCase.execute(input)).rejects.toThrow(ForbiddenError);
            expect(membershipRepository.findById).toHaveBeenCalledWith(input.membershipId);
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledWith(
                input.actorUserId,
                membership.companyId,
            );
            expect(membership.revoke).not.toHaveBeenCalled();
            expect(membershipRepository.update).not.toHaveBeenCalled();
        });

        it.each([
            ["finding the membership", "findMembership"],
            ["checking the platform tenant", "platformTenant"],
            ["finding the actor membership", "findActorMembership"],
            ["revoking the membership", "revokeMembership"],
            ["updating the membership", "updateMembership"],
        ])("should propagate errors when %s fails", async (_, operation) => {
            const { revokeMemberUseCase, tenantApi, membershipRepository } = makeSut();
            const error = new Error("Operation failed");
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership);
            membershipRepository.findActiveByUserAndCompany.mockResolvedValue({} as never);
            if (operation === "findMembership") {
                membershipRepository.findById.mockRejectedValue(error);
            } else if (operation === "platformTenant") {
                tenantApi.isPlatformTenant.mockRejectedValue(error);
            } else if (operation === "findActorMembership") {
                membershipRepository.findActiveByUserAndCompany.mockRejectedValue(error);
            } else if (operation === "revokeMembership") {
                membership.revoke = jest.fn().mockImplementation(() => {
                    throw error;
                });
            } else if (operation === "updateMembership") {
                membershipRepository.update.mockRejectedValue(error);
            }
            await expect(revokeMemberUseCase.execute(makeInput())).rejects.toThrow(error);
        });
    });
});
