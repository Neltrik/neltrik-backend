import { InvalidPermissionCodeError, InvalidPermissionDescriptionError } from "../../errors";
import type { PermissionProps } from "../../types";
import { Permission } from "./index";

const createProps = (): PermissionProps => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "permission-id",
        code: "USER_CREATE",
        description: "Allows creating users.",
        createdAt,
        updatedAt: createdAt,
    };
};

describe("Permission", () => {
    it("should restore a permission", () => {
        const permission = Permission.restore(createProps());
        expect(permission.id).toBe("permission-id");
        expect(permission.code).toBe("USER_CREATE");
    });

    it("should create a permission", () => {
        const permission = Permission.create(createProps());
        expect(permission.id).toBe("permission-id");
        expect(permission.code).toBe("USER_CREATE");
    });

    it("should throw InvalidPermissionCodeError when code is empty", () => {
        const props = createProps();
        props.code = "";
        expect(() => Permission.create(props)).toThrow(InvalidPermissionCodeError);
    });

    it("should throw InvalidPermissionCodeError when code contains only spaces", () => {
        const props = createProps();
        props.code = "   ";
        expect(() => Permission.create(props)).toThrow(InvalidPermissionCodeError);
    });

    it("should throw InvalidPermissionDescriptionError when description is empty", () => {
        const props = createProps();
        props.description = "";
        expect(() => Permission.create(props)).toThrow(InvalidPermissionDescriptionError);
    });

    it("should throw InvalidPermissionDescriptionError when description contains only spaces", () => {
        const props = createProps();
        props.description = "   ";
        expect(() => Permission.create(props)).toThrow(InvalidPermissionDescriptionError);
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const permission = Permission.create(props);
        expect(permission.id).toBe(props.id);
        expect(permission.code).toBe(props.code);
        expect(permission.description).toBe(props.description);
        expect(permission.createdAt).toEqual(props.createdAt);
        expect(permission.updatedAt).toEqual(props.updatedAt);
    });

    it("should update description successfully", () => {
        const permission = Permission.create(createProps());
        permission.update({ description: "Updated description." });
        expect(permission.description).toBe("Updated description.");
        expect(permission.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw InvalidPermissionDescriptionError when updating description with an empty value", () => {
        const permission = Permission.create(createProps());
        expect(() => {
            permission.update({ description: "" });
        }).toThrow(InvalidPermissionDescriptionError);
    });

    it("should not modify code when updating", () => {
        const permission = Permission.create(createProps());
        permission.update({ description: "Updated description." });
        expect(permission.code).toBe("USER_CREATE");
    });
});
