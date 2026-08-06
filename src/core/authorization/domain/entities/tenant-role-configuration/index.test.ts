import type { TenantRoleConfigurationProps } from "../../types";
import { DisplayName } from "../../value-objects";
import { TenantRoleConfiguration } from "./index";

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

describe("TenantRoleConfiguration", () => {
    it("should restore a tenant role configuration", () => {
        const configuration = TenantRoleConfiguration.restore(createProps());
        expect(configuration.id).toBe("configuration-id");
    });

    it("should create a tenant role configuration", () => {
        const configuration = TenantRoleConfiguration.create(createProps());
        expect(configuration.id).toBe("configuration-id");
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const configuration = TenantRoleConfiguration.create(props);
        expect(configuration.id).toBe(props.id);
        expect(configuration.tenantId).toBe(props.tenantId);
        expect(configuration.roleId).toBe(props.roleId);
        expect(configuration.displayName).toBe(props.displayName);
        expect(configuration.createdAt).toEqual(props.createdAt);
        expect(configuration.updatedAt).toEqual(props.updatedAt);
    });

    it("should update display name", () => {
        const configuration = TenantRoleConfiguration.create(createProps());
        configuration.update({ displayName: DisplayName.create("Manager") });
        expect(configuration.displayName.value).toBe("Manager");
        expect(configuration.updatedAt).toBeInstanceOf(Date);
    });

    it("should not update display name when no value is provided", () => {
        const configuration = TenantRoleConfiguration.create(createProps());
        configuration.update({});
        expect(configuration.displayName.value).toBe("Administrator");
    });
});
