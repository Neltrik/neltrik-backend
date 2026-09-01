import { type UserHasPermissionUseCase } from "../../../application/use-cases";
import { PermissionCheckerProvider } from "./index";

describe("PermissionCheckerProvider", () => {
    const makeSut = () => {
        const executeMock = jest.fn();
        const userHasPermissionUseCase = {
            execute: executeMock,
        } as unknown as UserHasPermissionUseCase;
        const provider = new PermissionCheckerProvider(userHasPermissionUseCase);
        return { provider, executeMock };
    };

    it("should return true when user has the permission", async () => {
        const { provider, executeMock } = makeSut();
        executeMock.mockResolvedValue(true);
        const result = await provider.hasPermission("user-id", "USER_CREATE");
        expect(executeMock).toHaveBeenCalledTimes(1);
        expect(executeMock).toHaveBeenCalledWith({ userId: "user-id", code: "USER_CREATE" });
        expect(result).toBe(true);
    });

    it("should return false when user does not have the permission", async () => {
        const { provider, executeMock } = makeSut();
        executeMock.mockResolvedValue(false);
        const result = await provider.hasPermission("user-id", "USER_CREATE");
        expect(executeMock).toHaveBeenCalledTimes(1);
        expect(executeMock).toHaveBeenCalledWith({ userId: "user-id", code: "USER_CREATE" });
        expect(result).toBe(false);
    });

    it("should propagate use case errors", async () => {
        const { provider, executeMock } = makeSut();
        executeMock.mockRejectedValue(new Error("Use case error"));
        await expect(provider.hasPermission("user-id", "USER_CREATE")).rejects.toThrow("Use case error");
        expect(executeMock).toHaveBeenCalledTimes(1);
        expect(executeMock).toHaveBeenCalledWith({ userId: "user-id", code: "USER_CREATE" });
    });
});
