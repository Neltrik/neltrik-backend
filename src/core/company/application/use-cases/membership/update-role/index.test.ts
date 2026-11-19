import type { AuthorizationRoleApi } from "@/core/authorization/api";
import type { TenantApi } from "@/core/tenant/api";
import { ForbiddenError } from "@/shared/errors";

import type { Membership } from "../../../../domain/entities";
import { MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepositorySpy } from "../../../../test-doubles";
import { UpdateMemberRoleUseCase } from "./index";
import type { UpdateMemberRoleInput } from "./input";

describe("UpdateMemberRoleUseCase", () => {
    const makeSut = () => {
        const authorizationRoleApi: jest.Mocked<AuthorizationRoleApi> = {
            validateForTenant: jest.fn().mockResolvedValue(undefined),
        } as never;
        const tenantApi: jest.Mocked<TenantApi> = {
            isPlatformTenant: jest.fn().mockResolvedValue(false),
        } as never;
        const membershipRepository = new MembershipRepositorySpy();
        const updateMemberRoleUseCase = new UpdateMemberRoleUseCase(
            authorizationRoleApi,
            tenantApi,
            membershipRepository,
        );
        return { updateMemberRoleUseCase, authorizationRoleApi, tenantApi, membershipRepository };
    };
    const makeInput = (): UpdateMemberRoleInput => ({
        membershipId: "membership-id",
        roleId: "new-role-id",
        actorTenantId: "actor-tenant-id",
        actorUserId: "actor-user-id",
    });
    const mockMembership = () => {
        const changeRole = jest.fn();

        const membership = {
            id: "membership-id",
            tenantId: "tenant-id",
            companyId: "company-id",
            changeRole,
        } as unknown as Membership;

        return membership;
    };

    describe("execute", () => {
        it("should update the membership role and return its id", async () => {
            const { updateMemberRoleUseCase, authorizationRoleApi, tenantApi, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership);
            membershipRepository.findActiveByUserAndCompany.mockResolvedValue({} as never);
            await expect(updateMemberRoleUseCase.execute(input)).resolves.toEqual({
                id: "membership-id",
            });
            expect(membershipRepository.findById).toHaveBeenCalledWith(input.membershipId);
            expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
            expect(membershipRepository.findActiveByUserAndCompany).toHaveBeenCalledWith(
                input.actorUserId,
                "company-id",
            );
            expect(authorizationRoleApi.validateForTenant).toHaveBeenCalledWith({
                roleId: input.roleId,
                tenantId: "tenant-id",
            });
            expect(membership.changeRole).toHaveBeenCalledWith(input.roleId);
            expect(membershipRepository.update).toHaveBeenCalledWith(membership);
        });

        it("should throw MembershipNotFoundError when the membership does not exist", async () => {
            const { updateMemberRoleUseCase, tenantApi, authorizationRoleApi, membershipRepository } = makeSut();
            membershipRepository.findById.mockResolvedValue(null);
            await expect(updateMemberRoleUseCase.execute(makeInput())).rejects.toThrow(MembershipNotFoundError);
            expect(tenantApi.isPlatformTenant).not.toHaveBeenCalled();
            expect(membershipRepository.findActiveByUserAndCompany).not.toHaveBeenCalled();
            expect(authorizationRoleApi.validateForTenant).not.toHaveBeenCalled();
            expect(membershipRepository.update).not.toHaveBeenCalled();
        });

        it("should allow updating the role when the actor belongs to a platform tenant", async () => {
            const { updateMemberRoleUseCase, tenantApi, authorizationRoleApi, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership);
            tenantApi.isPlatformTenant.mockResolvedValue(true);
            await expect(updateMemberRoleUseCase.execute(input)).resolves.toEqual({
                id: "membership-id",
            });
            expect(membershipRepository.findActiveByUserAndCompany).not.toHaveBeenCalled();
            expect(authorizationRoleApi.validateForTenant).toHaveBeenCalledWith({
                roleId: input.roleId,
                tenantId: "tenant-id",
            });
            expect(membership.changeRole).toHaveBeenCalledWith(input.roleId);
            expect(membershipRepository.update).toHaveBeenCalledWith(membership);
        });

        it("should throw ForbiddenError when the actor has no active membership in the company", async () => {
            const { updateMemberRoleUseCase, authorizationRoleApi, membershipRepository } = makeSut();
            membershipRepository.findById.mockResolvedValue(mockMembership());
            membershipRepository.findActiveByUserAndCompany.mockResolvedValue(null);
            await expect(updateMemberRoleUseCase.execute(makeInput())).rejects.toThrow(ForbiddenError);
            expect(authorizationRoleApi.validateForTenant).not.toHaveBeenCalled();
            expect(membershipRepository.update).not.toHaveBeenCalled();
        });

        it.each([
            ["finding the membership", "findMembership"],
            ["checking the platform tenant", "platformTenant"],
            ["finding the actor membership", "findActorMembership"],
            ["validating the role", "validateRole"],
            ["updating the membership", "updateMembership"],
        ])("should propagate errors when %s fails", async (_, operation) => {
            const { updateMemberRoleUseCase, tenantApi, authorizationRoleApi, membershipRepository } = makeSut();
            const error = new Error("Operation failed");
            membershipRepository.findById.mockResolvedValue(mockMembership());
            membershipRepository.findActiveByUserAndCompany.mockResolvedValue({} as never);
            if (operation === "findMembership") {
                membershipRepository.findById.mockRejectedValue(error);
            } else if (operation === "platformTenant") {
                tenantApi.isPlatformTenant.mockRejectedValue(error);
            } else if (operation === "findActorMembership") {
                membershipRepository.findActiveByUserAndCompany.mockRejectedValue(error);
            } else if (operation === "validateRole") {
                authorizationRoleApi.validateForTenant.mockRejectedValue(error);
            } else if (operation === "updateMembership") {
                membershipRepository.update.mockRejectedValue(error);
            }
            await expect(updateMemberRoleUseCase.execute(makeInput())).rejects.toThrow(error);
        });
    });
});
