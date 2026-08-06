import type { TenantRoleConfiguration as PrismaTenantRoleConfiguration } from "@prisma/client";

import { TenantRoleConfiguration } from "../../../domain/entities";
import type { TenantRoleConfigurationProps } from "../../../domain/types";
import { DisplayName } from "../../../domain/value-objects";
import { TenantRoleConfigurationMapper } from "./index";

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

describe("TenantRoleConfigurationMapper", () => {
    it("should map a domain tenant role configuration to persistence", () => {
        const configuration = TenantRoleConfiguration.restore(createProps());
        const persistence = TenantRoleConfigurationMapper.toPersistence(configuration);
        expect(persistence).toEqual({
            id: configuration.id,
            tenantId: configuration.tenantId,
            roleId: configuration.roleId,
            displayName: configuration.displayName.value,
            createdAt: configuration.createdAt,
            updatedAt: configuration.updatedAt,
        });
    });

    it("should map a persistence tenant role configuration to domain", () => {
        const props = createProps();
        const persistence: PrismaTenantRoleConfiguration = {
            id: props.id,
            tenantId: props.tenantId,
            roleId: props.roleId,
            displayName: props.displayName.value,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
        const configuration = TenantRoleConfigurationMapper.toDomain(persistence);
        expect(configuration).toBeInstanceOf(TenantRoleConfiguration);
        expect(configuration.id).toBe(persistence.id);
        expect(configuration.tenantId).toBe(persistence.tenantId);
        expect(configuration.roleId).toBe(persistence.roleId);
        expect(configuration.displayName.value).toBe(persistence.displayName);
        expect(configuration.createdAt).toEqual(persistence.createdAt);
        expect(configuration.updatedAt).toEqual(persistence.updatedAt);
    });
});
