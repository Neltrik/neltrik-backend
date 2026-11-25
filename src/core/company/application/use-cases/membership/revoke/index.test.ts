import { ForbiddenError } from "@/shared/errors";

import type { Membership } from "../../../../domain/entities";
import { MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepositorySpy } from "../../../../test-doubles";
import { RevokeMemberUseCase } from "./index";
import type { RevokeMemberInput } from "./input";

describe("RevokeMemberUseCase", () => {
    const makeSut = () => {
        const membershipRepository = new MembershipRepositorySpy();
        const revokeMemberUseCase = new RevokeMemberUseCase(membershipRepository);
        return { revokeMemberUseCase, membershipRepository };
    };
    const makeInput = (): RevokeMemberInput => ({ membershipId: "membership-id", actorUserId: "actor-user-id" });
    const mockMembership = () => {
        const revoke = jest.fn();
        const membership = { id: "membership-id", userId: "target-user-id", revoke } as unknown as Membership;
        return membership;
    };

    describe("execute", () => {
        it("should revoke the membership and return its id", async () => {
            const { revokeMemberUseCase, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership);
            await expect(revokeMemberUseCase.execute(input)).resolves.toEqual({ id: "membership-id" });
            expect(membershipRepository.findById).toHaveBeenCalledWith(input.membershipId);
            expect(membership.revoke).toHaveBeenCalledTimes(1);
            expect(membershipRepository.update).toHaveBeenCalledWith(membership);
        });

        it("should throw MembershipNotFoundError when the membership does not exist", async () => {
            const { revokeMemberUseCase, membershipRepository } = makeSut();
            membershipRepository.findById.mockResolvedValue(null);
            await expect(revokeMemberUseCase.execute(makeInput())).rejects.toThrow(MembershipNotFoundError);
            expect(membershipRepository.update).not.toHaveBeenCalled();
        });

        it("should throw ForbiddenError when the actor tries to revoke their own membership", async () => {
            const { revokeMemberUseCase, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = { ...mockMembership(), userId: input.actorUserId } as Membership;
            membershipRepository.findById.mockResolvedValue(membership);
            await expect(revokeMemberUseCase.execute(input)).rejects.toThrow(ForbiddenError);
            expect(membershipRepository.findById).toHaveBeenCalledWith(input.membershipId);
            expect(membership.revoke).not.toHaveBeenCalled();
            expect(membershipRepository.update).not.toHaveBeenCalled();
        });

        it.each([
            ["finding the membership", "findMembership"],
            ["revoking the membership", "revokeMembership"],
            ["updating the membership", "updateMembership"],
        ])("should propagate errors when %s fails", async (_, operation) => {
            const { revokeMemberUseCase, membershipRepository } = makeSut();
            const error = new Error("Operation failed");
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership);
            if (operation === "findMembership") {
                membershipRepository.findById.mockRejectedValue(error);
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
