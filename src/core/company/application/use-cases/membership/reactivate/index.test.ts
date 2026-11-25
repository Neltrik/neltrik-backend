import type { Membership } from "../../../../domain/entities";
import { MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepositorySpy } from "../../../../test-doubles";
import { ReactivateMemberUseCase } from "./index";
import type { ReactivateMemberInput } from "./input";

describe("ReactivateMemberUseCase", () => {
    const makeSut = () => {
        const membershipRepository = new MembershipRepositorySpy();
        const reactivateMemberUseCase = new ReactivateMemberUseCase(membershipRepository);
        return { reactivateMemberUseCase, membershipRepository };
    };
    const makeInput = (): ReactivateMemberInput => ({ membershipId: "membership-id" });
    const mockMembership = () => {
        const reactivate = jest.fn();
        const membership = { id: "membership-id", reactivate } as unknown as Membership;
        return membership;
    };

    describe("execute", () => {
        it("should reactivate the membership and return its id", async () => {
            const { reactivateMemberUseCase, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership);
            await expect(reactivateMemberUseCase.execute(input)).resolves.toEqual({ id: "membership-id" });
            expect(membershipRepository.findById).toHaveBeenCalledWith(input.membershipId);
            expect(membership.reactivate).toHaveBeenCalledTimes(1);
            expect(membershipRepository.update).toHaveBeenCalledWith(membership);
        });

        it("should throw MembershipNotFoundError when the membership does not exist", async () => {
            const { reactivateMemberUseCase, membershipRepository } = makeSut();
            membershipRepository.findById.mockResolvedValue(null);
            await expect(reactivateMemberUseCase.execute(makeInput())).rejects.toThrow(MembershipNotFoundError);
            expect(membershipRepository.update).not.toHaveBeenCalled();
        });

        it.each([
            ["finding the membership", "findMembership"],
            ["reactivating the membership", "reactivateMembership"],
            ["updating the membership", "updateMembership"],
        ])("should propagate errors when %s fails", async (_, operation) => {
            const { reactivateMemberUseCase, membershipRepository } = makeSut();
            const error = new Error("Operation failed");
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership);
            if (operation === "findMembership") {
                membershipRepository.findById.mockRejectedValue(error);
            } else if (operation === "reactivateMembership") {
                membership.reactivate = jest.fn().mockImplementation(() => {
                    throw error;
                });
            } else if (operation === "updateMembership") {
                membershipRepository.update.mockRejectedValue(error);
            }
            await expect(reactivateMemberUseCase.execute(makeInput())).rejects.toThrow(error);
        });
    });
});
