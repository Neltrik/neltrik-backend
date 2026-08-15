import { AuthorizationPolicyApiImpl } from "./index";

describe("AuthorizationPolicyApiImpl", () => {
    const makeSut = () => {
        const canSuspendUserPolicyOhsUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        const api = new AuthorizationPolicyApiImpl(canSuspendUserPolicyOhsUseCase as never);
        return { api, canSuspendUserPolicyOhsUseCase };
    };

    it("should execute the can suspend user policy use case successfully", async () => {
        const { api, canSuspendUserPolicyOhsUseCase } = makeSut();
        const input = { actorRoleId: "actor-role-id", targetRoleId: "target-role-id" };
        await api.canSuspend(input);
        expect(canSuspendUserPolicyOhsUseCase.execute).toHaveBeenCalledTimes(1);
        expect(canSuspendUserPolicyOhsUseCase.execute).toHaveBeenCalledWith(input);
    });

    it("should propagate policy errors", async () => {
        const { api, canSuspendUserPolicyOhsUseCase } = makeSut();
        canSuspendUserPolicyOhsUseCase.execute.mockRejectedValue(
            new Error("Authorization policy rejected the operation"),
        );
        await expect(api.canSuspend({ actorRoleId: "actor-role-id", targetRoleId: "target-role-id" })).rejects.toThrow(
            "Authorization policy rejected the operation",
        );
    });
});
