import type { IdGenerator } from "@/shared/id-generator";

import { TenantRoleConfigurationAlreadyExistsError } from "../../../../domain/errors";
import { TenantRoleConfigurationRepositorySpy } from "../../../../test-doubles";
import { CreateTenantRoleConfigurationUseCase } from "./index";
import type { CreateTenantRoleConfigurationInput } from "./input";

const makeInput = (): CreateTenantRoleConfigurationInput => ({
    tenantId: "tenant-id",
    roleId: "role-id",
    displayName: "Administrator",
});

describe("CreateTenantRoleConfigurationUseCase", () => {
    const makeSut = () => {
        const repository = new TenantRoleConfigurationRepositorySpy();
        repository.create.mockImplementation((configuration) => Promise.resolve(configuration));
        repository.findByTenantAndRole.mockResolvedValue(null);
        const generateMock = jest.fn().mockReturnValue("configuration-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const useCase = new CreateTenantRoleConfigurationUseCase(repository, idGenerator);
        return { useCase, repository, generateMock };
    };

    it("should create a tenant role configuration successfully", async () => {
        const { useCase, repository, generateMock } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(repository.findByTenantAndRole).toHaveBeenCalledWith("tenant-id", "role-id");
        expect(repository.create).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: "configuration-id" });
    });

    it("should throw TenantRoleConfigurationAlreadyExistsError when configuration already exists", async () => {
        const { useCase, repository } = makeSut();
        repository.findByTenantAndRole.mockResolvedValue({} as never);
        await expect(useCase.execute(makeInput())).rejects.toThrow(TenantRoleConfigurationAlreadyExistsError);
        expect(repository.create).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, repository } = makeSut();
        repository.create.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
