import { Role } from "../../../../domain/entities";
import { CannotSuspendHigherRoleError, RoleNotFoundError } from "../../../../domain/errors";
import { RoleRepositorySpy } from "../../../../test-doubles";
import { CanSuspendUserPolicyOhsUseCase } from "./index";

const makeRole = (id: string, code: string, scope: "PLATFORM" | "TENANT") =>
    Role.create({
        id,
        code,
        defaultDisplayName: code,
        description: `${code} role.`,
        permissionIds: [],
        scope,
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

describe("CanSuspendUserPolicyOhsUseCase", () => {
    const makeSut = () => {
        const roleRepository = new RoleRepositorySpy();
        const useCase = new CanSuspendUserPolicyOhsUseCase(roleRepository);
        return { useCase, roleRepository };
    };

    it("should allow suspension when actor has a higher role", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.get
            .mockResolvedValueOnce(makeRole("role-id-1", "TENANT_OWNER", "TENANT"))
            .mockResolvedValueOnce(makeRole("role-id-2", "TENANT_ADMIN", "TENANT"));
        await expect(useCase.execute({ actorRoleId: "role-id-1", targetRoleId: "role-id-2" })).resolves.toBeUndefined();
        expect(roleRepository.get).toHaveBeenCalledTimes(2);
        expect(roleRepository.get).toHaveBeenNthCalledWith(1, "role-id-1");
        expect(roleRepository.get).toHaveBeenNthCalledWith(2, "role-id-2");
    });

    it("should throw when actor does not have a higher role", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.get
            .mockResolvedValueOnce(makeRole("role-id-1", "TENANT_ADMIN", "TENANT"))
            .mockResolvedValueOnce(makeRole("role-id-2", "TENANT_OWNER", "TENANT"));
        await expect(useCase.execute({ actorRoleId: "role-id-1", targetRoleId: "role-id-2" })).rejects.toThrow(
            CannotSuspendHigherRoleError,
        );
        expect(roleRepository.get).toHaveBeenCalledTimes(2);
    });

    it("should throw when actor role does not exist", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.get.mockResolvedValueOnce(null);
        await expect(useCase.execute({ actorRoleId: "role-id-1", targetRoleId: "role-id-2" })).rejects.toThrow(
            RoleNotFoundError,
        );
        expect(roleRepository.get).toHaveBeenCalledTimes(1);
        expect(roleRepository.get).toHaveBeenCalledWith("role-id-1");
    });

    it("should throw when target role does not exist", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.get
            .mockResolvedValueOnce(makeRole("role-id-1", "TENANT_OWNER", "TENANT"))
            .mockResolvedValueOnce(null);
        await expect(useCase.execute({ actorRoleId: "role-id-1", targetRoleId: "role-id-2" })).rejects.toThrow(
            RoleNotFoundError,
        );
        expect(roleRepository.get).toHaveBeenCalledTimes(2);
        expect(roleRepository.get).toHaveBeenNthCalledWith(1, "role-id-1");
        expect(roleRepository.get).toHaveBeenNthCalledWith(2, "role-id-2");
    });

    it("should propagate role repository errors", async () => {
        const { useCase, roleRepository } = makeSut();
        roleRepository.get.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute({ actorRoleId: "role-id-1", targetRoleId: "role-id-2" })).rejects.toThrow(
            "Database error",
        );
    });
});
