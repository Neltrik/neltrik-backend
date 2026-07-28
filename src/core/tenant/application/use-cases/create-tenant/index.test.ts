import type { IdGenerator } from "@/shared/id-generator";

import { TenantRepositorySpy } from "../../../test-doubles";
import { type SlugGenerator } from "../../slug-generator";
import { CreateTenantUseCase } from "./index";
import type { CreateTenantInput } from "./input";

const makeInput = (): CreateTenantInput => ({ name: "Acme Corp" });

describe("CreateTenantUseCase", () => {
    const makeSut = () => {
        const tenantRepository = new TenantRepositorySpy();
        tenantRepository.create.mockResolvedValue(undefined);
        const generateMock = jest.fn().mockReturnValue("tenant-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const slugGenerateMock = jest.fn().mockReturnValue("acme-corp-tenant-id");
        const slugGenerator = { generate: slugGenerateMock } satisfies SlugGenerator;
        const useCase = new CreateTenantUseCase(tenantRepository, idGenerator, slugGenerator);
        return {
            useCase,
            tenantRepository,
            generateMock,
            slugGenerateMock,
        };
    };

    it("should create a tenant successfully", async () => {
        const { useCase, tenantRepository, generateMock, slugGenerateMock } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(slugGenerateMock).toHaveBeenCalledWith("Acme Corp", "tenant-id");
        expect(tenantRepository.create).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: "tenant-id" });
    });

    it("should propagate repository errors", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.create.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
