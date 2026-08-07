import { TenantRoleConfiguration } from "../../../../domain/entities";
import { TenantRoleConfigurationNotFoundError } from "../../../../domain/errors";
import type { TenantRoleConfigurationProps } from "../../../../domain/types";
import { DisplayName } from "../../../../domain/value-objects";
import { TenantRoleConfigurationRepositorySpy } from "../../../../test-doubles";
import { UpdateTenantRoleConfigurationUseCase } from "./index";
import type { UpdateTenantRoleConfigurationInput } from "./input";

const createProps = (): TenantRoleConfigurationProps => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "configuration-id",
        tenantId: "tenant-id",
        roleId: "role-id",
        displayName: DisplayName.create("Administrator"),
        createdAt,
        updatedAt: createdAt,
    };
};

const makeInput = (): UpdateTenantRoleConfigurationInput => ({
    id: "configuration-id",
    displayName: "Owner",
});

describe("UpdateTenantRoleConfigurationUseCase", () => {
    const makeSut = () => {
        const repository = new TenantRoleConfigurationRepositorySpy();
        repository.get.mockResolvedValue(TenantRoleConfiguration.restore(createProps()));
        repository.update.mockResolvedValue(TenantRoleConfiguration.restore(createProps()));
        const useCase = new UpdateTenantRoleConfigurationUseCase(repository);
        return { useCase, repository };
    };

    it("should update a tenant role configuration successfully", async () => {
        const { useCase, repository } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(repository.get).toHaveBeenCalledWith("configuration-id");
        expect(repository.update).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: "configuration-id" });
    });

    it("should throw TenantRoleConfigurationNotFoundError when configuration does not exist", async () => {
        const { useCase, repository } = makeSut();
        repository.get.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(TenantRoleConfigurationNotFoundError);
        expect(repository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, repository } = makeSut();
        repository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
