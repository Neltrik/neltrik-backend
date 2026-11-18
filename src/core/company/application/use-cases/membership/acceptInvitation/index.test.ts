import { ForbiddenError } from "@/shared/errors";

import { MembershipExpiredError, MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepositorySpy } from "../../../../test-doubles";
import { AcceptInvitationUseCase } from "./index";
import type { AcceptInvitationInput } from "./input";

describe("AcceptInvitationUseCase", () => {
    const makeSut = () => {
        const membershipRepository = new MembershipRepositorySpy();
        const acceptInvitationUseCase = new AcceptInvitationUseCase(membershipRepository);
        return { acceptInvitationUseCase, membershipRepository };
    };

    const makeInput = (): AcceptInvitationInput => ({ membershipId: "membership-id", actorUserId: "user-id" });
    const mockMembership = (overrides = {}) => ({
        id: "membership-id",
        userId: "user-id",
        isExpired: jest.fn().mockReturnValue(false),
        accept: jest.fn(),
        ...overrides,
    });

    describe("execute", () => {
        it("should accept the invitation and return its id", async () => {
            const { acceptInvitationUseCase, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership as never);
            await expect(acceptInvitationUseCase.execute(input)).resolves.toEqual({
                id: "membership-id",
            });
            expect(membershipRepository.findById).toHaveBeenCalledWith(input.membershipId);
            expect(membership.isExpired).toHaveBeenCalledTimes(1);
            expect(membership.accept).toHaveBeenCalledTimes(1);
            expect(membershipRepository.update).toHaveBeenCalledWith(membership);
        });

        it("should throw MembershipNotFoundError when the membership does not exist", async () => {
            const { acceptInvitationUseCase, membershipRepository } = makeSut();
            membershipRepository.findById.mockResolvedValue(null);
            await expect(acceptInvitationUseCase.execute(makeInput())).rejects.toThrow(MembershipNotFoundError);
            expect(membershipRepository.update).not.toHaveBeenCalled();
        });

        it("should throw ForbiddenError when the actor is not the membership owner", async () => {
            const { acceptInvitationUseCase, membershipRepository } = makeSut();
            const input = { ...makeInput(), actorUserId: "another-user-id" };
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership as never);
            await expect(acceptInvitationUseCase.execute(input)).rejects.toThrow(ForbiddenError);
            expect(membership.isExpired).not.toHaveBeenCalled();
            expect(membership.accept).not.toHaveBeenCalled();
            expect(membershipRepository.update).not.toHaveBeenCalled();
        });

        it("should throw MembershipExpiredError when the membership has expired", async () => {
            const { acceptInvitationUseCase, membershipRepository } = makeSut();
            const membership = mockMembership({
                isExpired: jest.fn().mockReturnValue(true),
            });
            membershipRepository.findById.mockResolvedValue(membership as never);
            await expect(acceptInvitationUseCase.execute(makeInput())).rejects.toThrow(MembershipExpiredError);
            expect(membership.isExpired).toHaveBeenCalledTimes(1);
            expect(membership.accept).not.toHaveBeenCalled();
            expect(membershipRepository.update).not.toHaveBeenCalled();
        });

        it.each([
            ["finding the membership", "findMembership"],
            ["updating the membership", "updateMembership"],
        ])("should propagate errors when %s fails", async (_, operation) => {
            const { acceptInvitationUseCase, membershipRepository } = makeSut();
            const error = new Error("Operation failed");
            membershipRepository.findById.mockResolvedValue(mockMembership() as never);
            if (operation === "findMembership") {
                membershipRepository.findById.mockRejectedValue(error);
            } else {
                membershipRepository.update.mockRejectedValue(error);
            }
            await expect(acceptInvitationUseCase.execute(makeInput())).rejects.toThrow("Operation failed");
        });
    });
});
