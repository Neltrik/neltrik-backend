import { CreateMembershipOhsUseCaseSpy } from "../../test-doubles";
import { MembershipApiImpl } from "./index";

const input = { tenantId: "tenant-id", userId: "user-id", companyId: "company-id", roleId: "role-id" };

describe("MembershipApiImpl", () => {
    const makeSut = () => {
        const createMembershipOhsUseCase = new CreateMembershipOhsUseCaseSpy();
        const membershipApi = new MembershipApiImpl(createMembershipOhsUseCase);

        return { membershipApi, createMembershipOhsUseCase };
    };

    describe("create", () => {
        it("should create a membership successfully", async () => {
            const { membershipApi, createMembershipOhsUseCase } = makeSut();
            createMembershipOhsUseCase.execute.mockResolvedValue(undefined);
            await expect(membershipApi.create(input)).resolves.toBeUndefined();
            expect(createMembershipOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(createMembershipOhsUseCase.execute).toHaveBeenCalledWith(input);
        });

        it("should propagate membership creation errors", async () => {
            const { membershipApi, createMembershipOhsUseCase } = makeSut();
            createMembershipOhsUseCase.execute.mockRejectedValue(new Error("Failed to create membership"));
            await expect(membershipApi.create(input)).rejects.toThrow("Failed to create membership");
            expect(createMembershipOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(createMembershipOhsUseCase.execute).toHaveBeenCalledWith(input);
        });
    });
});
