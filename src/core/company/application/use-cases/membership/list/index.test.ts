import type { Company } from "../../../../domain/entities";
import { CompanyRepositorySpy, MembershipRepositorySpy } from "../../../../test-doubles";
import { ListMembersUseCase } from "./index";
import type { ListMembersInput } from "./input";

describe("ListMembersUseCase", () => {
    const makeSut = () => {
        const companyRepository = new CompanyRepositorySpy();
        const membershipRepository = new MembershipRepositorySpy();
        const useCase = new ListMembersUseCase(companyRepository, membershipRepository);
        return { useCase, companyRepository, membershipRepository };
    };
    const makeInput = (): ListMembersInput => ({
        companyId: "company-id",
        cursor: undefined,
        limit: 10,
        actorTenantId: "",
        actorUserId: "",
    });
    const makeCompany = (id: string): Company =>
        ({
            id,
        }) as Company;
    const makeMembership = (id: string) => ({ id });

    it("should throw CompanyNotFoundError when the company does not exist", async () => {
        const { useCase, companyRepository, membershipRepository } = makeSut();
        const input = makeInput();
        companyRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(input)).rejects.toThrow("The company was not found.");
        expect(companyRepository.findById).toHaveBeenCalledTimes(1);
        expect(companyRepository.findById).toHaveBeenCalledWith(input.companyId);
        expect(membershipRepository.findByCompany).not.toHaveBeenCalled();
    });

    it("should return members belonging to the specified company", async () => {
        const { useCase, companyRepository, membershipRepository } = makeSut();
        const input = makeInput();
        const company = makeCompany(input.companyId);
        const memberships = [makeMembership("membership-1"), makeMembership("membership-2")];
        companyRepository.findById.mockResolvedValue(company);
        membershipRepository.findByCompany.mockResolvedValue(memberships as never);
        const result = await useCase.execute(input);
        expect(companyRepository.findById).toHaveBeenCalledTimes(1);
        expect(companyRepository.findById).toHaveBeenCalledWith(input.companyId);
        expect(membershipRepository.findByCompany).toHaveBeenCalledTimes(1);
        expect(membershipRepository.findByCompany).toHaveBeenCalledWith({
            companyId: input.companyId,
            cursor: input.cursor,
            limit: input.limit,
        });
        expect(result.memberships).toEqual(memberships);
        expect(result.meta).toBeDefined();
    });

    it("should return an empty list when no memberships are found", async () => {
        const { useCase, companyRepository, membershipRepository } = makeSut();
        const input = makeInput();
        companyRepository.findById.mockResolvedValue(makeCompany(input.companyId));
        membershipRepository.findByCompany.mockResolvedValue([]);
        const result = await useCase.execute(input);
        expect(membershipRepository.findByCompany).toHaveBeenCalledTimes(1);
        expect(result.memberships).toEqual([]);
        expect(result.meta).toBeDefined();
    });

    it("should pass the cursor and limit to the repository", async () => {
        const { useCase, companyRepository, membershipRepository } = makeSut();
        const input: ListMembersInput = {
            companyId: "company-id",
            cursor: "membership-5",
            limit: 5,
            actorTenantId: "",
            actorUserId: "",
        };
        companyRepository.findById.mockResolvedValue(makeCompany(input.companyId));
        membershipRepository.findByCompany.mockResolvedValue([]);
        await useCase.execute(input);
        expect(membershipRepository.findByCompany).toHaveBeenCalledWith({
            companyId: input.companyId,
            cursor: input.cursor,
            limit: input.limit,
        });
    });

    it("should propagate company repository errors", async () => {
        const { useCase, companyRepository, membershipRepository } = makeSut();
        const input = makeInput();
        companyRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(input)).rejects.toThrow("Database error");
        expect(companyRepository.findById).toHaveBeenCalledTimes(1);
        expect(companyRepository.findById).toHaveBeenCalledWith(input.companyId);
        expect(membershipRepository.findByCompany).not.toHaveBeenCalled();
    });

    it("should propagate membership repository errors", async () => {
        const { useCase, companyRepository, membershipRepository } = makeSut();
        const input = makeInput();
        companyRepository.findById.mockResolvedValue(makeCompany(input.companyId));
        membershipRepository.findByCompany.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(input)).rejects.toThrow("Database error");
        expect(membershipRepository.findByCompany).toHaveBeenCalledTimes(1);
        expect(membershipRepository.findByCompany).toHaveBeenCalledWith({
            companyId: input.companyId,
            cursor: input.cursor,
            limit: input.limit,
        });
    });

    it("should paginate memberships when there are more items than the limit", async () => {
        const { useCase, companyRepository, membershipRepository } = makeSut();
        const input: ListMembersInput = {
            companyId: "company-id",
            cursor: undefined,
            limit: 2,
            actorTenantId: "",
            actorUserId: "",
        };
        const memberships = [
            makeMembership("membership-1"),
            makeMembership("membership-2"),
            makeMembership("membership-3"),
        ];
        companyRepository.findById.mockResolvedValue(makeCompany(input.companyId));
        membershipRepository.findByCompany.mockResolvedValue(memberships as never);
        const result = await useCase.execute(input);
        expect(result.memberships).toHaveLength(2);
        expect(result.memberships).toEqual([memberships[0], memberships[1]]);
        expect(result.meta).toBeDefined();
    });

    it("should return all memberships when the number of items does not exceed the limit", async () => {
        const { useCase, companyRepository, membershipRepository } = makeSut();
        const input: ListMembersInput = {
            companyId: "company-id",
            cursor: undefined,
            limit: 3,
            actorTenantId: "",
            actorUserId: "",
        };
        const memberships = [makeMembership("membership-1"), makeMembership("membership-2")];
        companyRepository.findById.mockResolvedValue(makeCompany(input.companyId));
        membershipRepository.findByCompany.mockResolvedValue(memberships as never);
        const result = await useCase.execute(input);
        expect(result.memberships).toEqual(memberships);
        expect(result.memberships).toHaveLength(2);
        expect(result.meta).toBeDefined();
    });
});
