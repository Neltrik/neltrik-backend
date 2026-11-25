import type { Membership } from "../../../../domain/entities";
import { MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepositorySpy } from "../../../../test-doubles";
import { GetMembershipUseCase } from "./index";
import type { GetMembershipInput } from "./input";

describe("GetMembershipUseCase", () => {
    const makeSut = () => {
        const membershipRepository = new MembershipRepositorySpy();
        const getMembershipUseCase = new GetMembershipUseCase(membershipRepository);
        return { getMembershipUseCase, membershipRepository };
    };
    const makeInput = (): GetMembershipInput => ({ membershipId: "membership-id", actorTenantId: "", actorUserId: "" });
    const mockMembership = () =>
        ({ id: "membership-id", tenantId: "tenant-id", companyId: "company-id", userId: "user-id" }) as Membership;

    describe("execute", () => {
        it("should return the membership when it exists", async () => {
            const { getMembershipUseCase, membershipRepository } = makeSut();
            const input = makeInput();
            const membership = mockMembership();
            membershipRepository.findById.mockResolvedValue(membership);
            await expect(getMembershipUseCase.execute(input)).resolves.toEqual({ membership });
            expect(membershipRepository.findById).toHaveBeenCalledWith(input.membershipId);
            expect(membershipRepository.findById).toHaveBeenCalledTimes(1);
        });

        it("should throw MembershipNotFoundError when the membership does not exist", async () => {
            const { getMembershipUseCase, membershipRepository } = makeSut();
            const input = makeInput();
            membershipRepository.findById.mockResolvedValue(null);
            await expect(getMembershipUseCase.execute(input)).rejects.toThrow(MembershipNotFoundError);
            expect(membershipRepository.findById).toHaveBeenCalledWith(input.membershipId);
            expect(membershipRepository.findById).toHaveBeenCalledTimes(1);
        });

        it("should propagate errors when finding the membership fails", async () => {
            const { getMembershipUseCase, membershipRepository } = makeSut();
            const input = makeInput();
            const error = new Error("Operation failed");
            membershipRepository.findById.mockRejectedValue(error);
            await expect(getMembershipUseCase.execute(input)).rejects.toThrow(error);
            expect(membershipRepository.findById).toHaveBeenCalledWith(input.membershipId);
        });
    });
});
