import { ForbiddenError } from "@/shared/errors";

import type { Membership } from "../../../../domain/entities";
import { MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepositorySpy } from "../../../../test-doubles";
import { SuspendMemberUseCase } from "./index";
import type { SuspendMemberInput } from "./input";

describe("SuspendMemberUseCase", () => {
    const makeSut = () => {
        const membershipRepository = new MembershipRepositorySpy();
        const suspendMemberUseCase = new SuspendMemberUseCase(membershipRepository);
        return { suspendMemberUseCase, membershipRepository };
    };
    const makeInput = (): SuspendMemberInput => ({ membershipId: "membership-id", actorUserId: "actor-user-id" });
    const mockMembership = () => {
        const suspend = jest.fn();
        const membership = { id: "membership-id", userId: "target-user-id", suspend } as unknown as Membership;
        return membership;
    };

    describe("execute", () => {
        it("should suspend the membership and return its id", async () => {
            const { suspendMemberUseCase, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership);
            await expect(suspendMemberUseCase.execute(input)).resolves.toEqual({ id: "membership-id" });
            expect(membershipRepository.findById).toHaveBeenCalledWith(input.membershipId);
            expect(membership.suspend).toHaveBeenCalledTimes(1);
            expect(membershipRepository.update).toHaveBeenCalledWith(membership);
        });

        it("should throw MembershipNotFoundError when the membership does not exist", async () => {
            const { suspendMemberUseCase, membershipRepository } = makeSut();
            membershipRepository.findById.mockResolvedValue(null);
            await expect(suspendMemberUseCase.execute(makeInput())).rejects.toThrow(MembershipNotFoundError);
            expect(membershipRepository.update).not.toHaveBeenCalled();
        });

        it("should throw ForbiddenError when the actor tries to suspend their own membership", async () => {
            const { suspendMemberUseCase, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = { ...mockMembership(), userId: input.actorUserId } as Membership;
            membershipRepository.findById.mockResolvedValue(membership);
            await expect(suspendMemberUseCase.execute(input)).rejects.toThrow(ForbiddenError);
            expect(membershipRepository.findById).toHaveBeenCalledWith(input.membershipId);
            expect(membership.suspend).not.toHaveBeenCalled();
            expect(membershipRepository.update).not.toHaveBeenCalled();
        });

        it.each([
            ["finding the membership", "findMembership"],
            ["suspending the membership", "suspendMembership"],
            ["updating the membership", "updateMembership"],
        ])("should propagate errors when %s fails", async (_, operation) => {
            const { suspendMemberUseCase, membershipRepository } = makeSut();
            const error = new Error("Operation failed");
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership);
            if (operation === "findMembership") {
                membershipRepository.findById.mockRejectedValue(error);
            } else if (operation === "suspendMembership") {
                membership.suspend = jest.fn().mockImplementation(() => {
                    throw error;
                });
            } else if (operation === "updateMembership") {
                membershipRepository.update.mockRejectedValue(error);
            }
            await expect(suspendMemberUseCase.execute(makeInput())).rejects.toThrow(error);
        });
    });
});
