import { TenantRoleConfiguration } from "../../../../domain/entities";
import type { TenantRoleConfigurationProps } from "../../../../domain/types";
import { DisplayName } from "../../../../domain/value-objects";
import { TenantRoleConfigurationRepositorySpy } from "../../../../test-doubles";
import { ListTenantRoleConfigurationsUseCase } from "./index";
import type { ListTenantRoleConfigurationsInput } from "./input";

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

const makeInput = (): ListTenantRoleConfigurationsInput => ({
    tenantId: "tenant-id",
});

describe("ListTenantRoleConfigurationsUseCase", () => {
    const makeSut = () => {
        const repository = new TenantRoleConfigurationRepositorySpy();
        repository.list.mockResolvedValue([TenantRoleConfiguration.restore(createProps())]);
        const useCase = new ListTenantRoleConfigurationsUseCase(repository);
        return { useCase, repository };
    };

    it("should list tenant role configurations", async () => {
        const { useCase, repository } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(repository.list).toHaveBeenCalledWith("tenant-id");
        expect(result).toHaveLength(1);
    });

    it("should propagate repository errors", async () => {
        const { useCase, repository } = makeSut();
        repository.list.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
