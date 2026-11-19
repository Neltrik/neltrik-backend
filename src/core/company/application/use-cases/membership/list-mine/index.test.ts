import { MembershipRepositorySpy } from "../../../../test-doubles";
import { ListMyMembershipsUseCase } from "./index";
import type { ListMyMembershipsInput } from "./input";

describe("ListMyMembershipsUseCase", () => {
    const makeSut = () => {
        const membershipRepository = new MembershipRepositorySpy();
        const useCase = new ListMyMembershipsUseCase(membershipRepository);
        return { useCase, membershipRepository };
    };
    const makeInput = (): ListMyMembershipsInput => ({ actorUserId: "user-id", cursor: undefined, limit: 10 });
    const makeMembership = (id: string) => ({ id });
    it("should return memberships belonging to the authenticated user", async () => {
        const { useCase, membershipRepository } = makeSut();
        const input = makeInput();
        const memberships = [makeMembership("membership-1"), makeMembership("membership-2")];
        membershipRepository.findByUser.mockResolvedValue(memberships as never);
        const result = await useCase.execute(input);
        expect(membershipRepository.findByUser).toHaveBeenCalledTimes(1);
        expect(membershipRepository.findByUser).toHaveBeenCalledWith({
            userId: input.actorUserId,
            status: input.status,
            cursor: input.cursor,
            limit: input.limit,
        });
        expect(result.memberships).toEqual(memberships);
        expect(result.meta).toBeDefined();
    });

    it("should return an empty list when no memberships are found", async () => {
        const { useCase, membershipRepository } = makeSut();
        const input = makeInput();
        membershipRepository.findByUser.mockResolvedValue([]);
        const result = await useCase.execute(input);
        expect(membershipRepository.findByUser).toHaveBeenCalledTimes(1);
        expect(result.memberships).toEqual([]);
        expect(result.meta).toBeDefined();
    });

    it("should pass the status filter to the repository", async () => {
        const { useCase, membershipRepository } = makeSut();
        const input: ListMyMembershipsInput = {
            actorUserId: "user-id",
            status: "ACTIVE",
            cursor: undefined,
            limit: 10,
        };
        membershipRepository.findByUser.mockResolvedValue([]);
        await useCase.execute(input);
        expect(membershipRepository.findByUser).toHaveBeenCalledWith({
            userId: input.actorUserId,
            status: input.status,
            cursor: input.cursor,
            limit: input.limit,
        });
    });

    it("should pass the cursor and limit to the repository", async () => {
        const { useCase, membershipRepository } = makeSut();
        const input: ListMyMembershipsInput = { actorUserId: "user-id", cursor: "membership-5", limit: 5 };
        membershipRepository.findByUser.mockResolvedValue([]);
        await useCase.execute(input);
        expect(membershipRepository.findByUser).toHaveBeenCalledWith({
            userId: input.actorUserId,
            status: input.status,
            cursor: input.cursor,
            limit: input.limit,
        });
    });

    it("should propagate membership repository errors", async () => {
        const { useCase, membershipRepository } = makeSut();
        const input = makeInput();
        membershipRepository.findByUser.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(input)).rejects.toThrow("Database error");
        expect(membershipRepository.findByUser).toHaveBeenCalledTimes(1);
        expect(membershipRepository.findByUser).toHaveBeenCalledWith({
            userId: input.actorUserId,
            status: input.status,
            cursor: input.cursor,
            limit: input.limit,
        });
    });

    it("should paginate memberships when there are more items than the limit", async () => {
        const { useCase, membershipRepository } = makeSut();
        const input: ListMyMembershipsInput = { actorUserId: "user-id", cursor: undefined, limit: 2 };
        const memberships = [
            makeMembership("membership-1"),
            makeMembership("membership-2"),
            makeMembership("membership-3"),
        ];
        membershipRepository.findByUser.mockResolvedValue(memberships as never);
        const result = await useCase.execute(input);
        expect(result.memberships).toHaveLength(2);
        expect(result.memberships).toEqual([memberships[0], memberships[1]]);
        expect(result.meta).toBeDefined();
    });

    it("should return all memberships when the number of items does not exceed the limit", async () => {
        const { useCase, membershipRepository } = makeSut();
        const input: ListMyMembershipsInput = { actorUserId: "user-id", cursor: undefined, limit: 3 };
        const memberships = [makeMembership("membership-1"), makeMembership("membership-2")];
        membershipRepository.findByUser.mockResolvedValue(memberships as never);
        const result = await useCase.execute(input);
        expect(result.memberships).toEqual(memberships);
        expect(result.memberships).toHaveLength(2);
        expect(result.meta).toBeDefined();
    });
});
