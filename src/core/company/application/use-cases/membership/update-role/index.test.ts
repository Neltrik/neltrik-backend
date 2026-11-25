import type { AuthorizationRoleApi } from "@/core/authorization/api";
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
        const membershipRepository = new MembershipRepositorySpy();
        const updateMemberRoleUseCase = new UpdateMemberRoleUseCase(authorizationRoleApi, membershipRepository);
        return { updateMemberRoleUseCase, authorizationRoleApi, membershipRepository };
    };
    const makeInput = (): UpdateMemberRoleInput => ({
        membershipId: "membership-id",
        roleId: "new-role-id",
        actorUserId: "actor-user-id",
        actorTenantId: "",
    });
    const mockMembership = () => {
        const changeRole = jest.fn();
        const membership = {
            id: "membership-id",
            tenantId: "tenant-id",
            companyId: "company-id",
            userId: "target-user-id",
            changeRole,
        } as unknown as Membership;
        return membership;
    };

    describe("execute", () => {
        it("should update the membership role and return its id", async () => {
            const { updateMemberRoleUseCase, authorizationRoleApi, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership);
            await expect(updateMemberRoleUseCase.execute(input)).resolves.toEqual({
                id: "membership-id",
            });
            expect(membershipRepository.findById).toHaveBeenCalledWith(input.membershipId);
            expect(authorizationRoleApi.validateForTenant).toHaveBeenCalledWith({
                roleId: input.roleId,
                tenantId: "tenant-id",
            });
            expect(membership.changeRole).toHaveBeenCalledWith(input.roleId);
            expect(membershipRepository.update).toHaveBeenCalledWith(membership);
        });

        it("should throw MembershipNotFoundError when the membership does not exist", async () => {
            const { updateMemberRoleUseCase, authorizationRoleApi, membershipRepository } = makeSut();
            membershipRepository.findById.mockResolvedValue(null);
            await expect(updateMemberRoleUseCase.execute(makeInput())).rejects.toThrow(MembershipNotFoundError);
            expect(authorizationRoleApi.validateForTenant).not.toHaveBeenCalled();
            expect(membershipRepository.update).not.toHaveBeenCalled();
        });

        it("should throw ForbiddenError when the actor tries to update their own membership role", async () => {
            const { updateMemberRoleUseCase, authorizationRoleApi, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = { ...mockMembership(), userId: input.actorUserId } as Membership;
            membershipRepository.findById.mockResolvedValue(membership);
            await expect(updateMemberRoleUseCase.execute(input)).rejects.toThrow(ForbiddenError);
            expect(membershipRepository.findById).toHaveBeenCalledWith(input.membershipId);
            expect(authorizationRoleApi.validateForTenant).not.toHaveBeenCalled();
            expect(membership.changeRole).not.toHaveBeenCalled();
            expect(membershipRepository.update).not.toHaveBeenCalled();
        });

        it.each([
            ["finding the membership", "findMembership"],
            ["validating the role", "validateRole"],
            ["updating the membership", "updateMembership"],
        ])("should propagate errors when %s fails", async (_, operation) => {
            const { updateMemberRoleUseCase, authorizationRoleApi, membershipRepository } = makeSut();
            const error = new Error("Operation failed");
            membershipRepository.findById.mockResolvedValue(mockMembership());
            if (operation === "findMembership") {
                membershipRepository.findById.mockRejectedValue(error);
            } else if (operation === "validateRole") {
                authorizationRoleApi.validateForTenant.mockRejectedValue(error);
            } else if (operation === "updateMembership") {
                membershipRepository.update.mockRejectedValue(error);
            }
            await expect(updateMemberRoleUseCase.execute(makeInput())).rejects.toThrow(error);
        });
    });
});
