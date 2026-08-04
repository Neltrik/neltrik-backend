import { InvalidRoleCodeError, InvalidRoleDescriptionError, InvalidRoleDisplayNameError } from "../../errors";
import type { RoleProps } from "../../types";
import { Role } from "./index";

const createProps = (): RoleProps => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "role-id",
        code: "TENANT_ADMIN",
        defaultDisplayName: "Tenant Admin",
        description: "Administrator of a tenant.",
        createdAt,
        updatedAt: createdAt,
    };
};

describe("Role", () => {
    it("should restore a role", () => {
        const role = Role.restore(createProps());
        expect(role.id).toBe("role-id");
    });

    it("should create a role", () => {
        const role = Role.create(createProps());
        expect(role.id).toBe("role-id");
    });

    it("should throw InvalidRoleCodeError when code is empty", () => {
        const props = createProps();
        props.code = "";
        expect(() => Role.create(props)).toThrow(InvalidRoleCodeError);
    });

    it("should throw InvalidRoleCodeError when code contains only spaces", () => {
        const props = createProps();
        props.code = "   ";
        expect(() => Role.create(props)).toThrow(InvalidRoleCodeError);
    });

    it("should throw InvalidRoleDisplayNameError when display name is empty", () => {
        const props = createProps();
        props.defaultDisplayName = "";
        expect(() => Role.create(props)).toThrow(InvalidRoleDisplayNameError);
    });

    it("should throw InvalidRoleDisplayNameError when display name contains only spaces", () => {
        const props = createProps();
        props.defaultDisplayName = "   ";
        expect(() => Role.create(props)).toThrow(InvalidRoleDisplayNameError);
    });

    it("should throw InvalidRoleDescriptionError when description is empty", () => {
        const props = createProps();
        props.description = "";
        expect(() => Role.create(props)).toThrow(InvalidRoleDescriptionError);
    });

    it("should throw InvalidRoleDescriptionError when description contains only spaces", () => {
        const props = createProps();
        props.description = "   ";
        expect(() => Role.create(props)).toThrow(InvalidRoleDescriptionError);
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const role = Role.create(props);
        expect(role.id).toBe(props.id);
        expect(role.code).toBe(props.code);
        expect(role.defaultDisplayName).toBe(props.defaultDisplayName);
        expect(role.description).toBe(props.description);
        expect(role.createdAt).toEqual(props.createdAt);
        expect(role.updatedAt).toEqual(props.updatedAt);
    });

    it("should update display name and description", () => {
        const role = Role.create(createProps());
        role.update({ defaultDisplayName: "Administrator", description: "Updated description." });
        expect(role.defaultDisplayName).toBe("Administrator");
        expect(role.description).toBe("Updated description.");
        expect(role.updatedAt).toBeInstanceOf(Date);
    });

    it("should update only display name", () => {
        const role = Role.create(createProps());
        role.update({ defaultDisplayName: "Administrator" });
        expect(role.defaultDisplayName).toBe("Administrator");
        expect(role.description).toBe("Administrator of a tenant.");
    });

    it("should update only description", () => {
        const role = Role.create(createProps());
        role.update({ description: "Updated description." });
        expect(role.defaultDisplayName).toBe("Tenant Admin");
        expect(role.description).toBe("Updated description.");
    });

    it("should throw InvalidRoleDisplayNameError when updating display name with an empty value", () => {
        const role = Role.create(createProps());
        expect(() => {
            role.update({ defaultDisplayName: "" });
        }).toThrow(InvalidRoleDisplayNameError);
    });

    it("should throw InvalidRoleDescriptionError when updating description with an empty value", () => {
        const role = Role.create(createProps());
        expect(() => {
            role.update({ description: "" });
        }).toThrow(InvalidRoleDescriptionError);
    });
});
