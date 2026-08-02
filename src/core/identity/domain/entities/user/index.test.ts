import { InvalidFirstNameError, InvalidLastNameError } from "../../errors";
import type { UserState } from "../../types";
import { USER_STATUS } from "../../types";
import { Email } from "../../value-objects/email";
import { User } from "./index";

const createProps = (): Omit<UserState, "status"> => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "user-id",
        firstName: "Omar",
        lastName: "Vargas",
        email: Email.create("omar@gmail.com"),
        tenantId: "tenant-id",
        roleId: "role-id",
        createdAt,
        updatedAt: createdAt,
        suspendedAt: null,
    };
};

const restoreProps = (): UserState => ({
    ...createProps(),
    status: USER_STATUS.SUSPENDED,
});

describe("User", () => {
    it("should restore a user preserving its persisted status", () => {
        const user = User.restore(restoreProps());
        expect(user.status).toBe(USER_STATUS.SUSPENDED);
    });

    it("should create a user with active status", () => {
        const user = User.create(createProps());
        expect(user.status).toBe(USER_STATUS.ACTIVE);
    });

    it("should throw InvalidFirstNameError when first name is empty", () => {
        const props = createProps();
        props.firstName = "";
        expect(() => User.create(props)).toThrow(InvalidFirstNameError);
    });

    it("should throw InvalidFirstNameError when first name contains only spaces", () => {
        const props = createProps();
        props.firstName = "   ";
        expect(() => User.create(props)).toThrow(InvalidFirstNameError);
    });

    it("should throw InvalidLastNameError when last name is empty", () => {
        const props = createProps();
        props.lastName = "";
        expect(() => User.create(props)).toThrow(InvalidLastNameError);
    });

    it("should throw InvalidLastNameError when last name contains only spaces", () => {
        const props = createProps();
        props.lastName = "   ";
        expect(() => User.create(props)).toThrow(InvalidLastNameError);
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const user = User.create(props);
        expect(user.id).toBe(props.id);
        expect(user.firstName).toBe(props.firstName);
        expect(user.lastName).toBe(props.lastName);
        expect(user.email).toEqual(props.email);
        expect(user.tenantId).toBe(props.tenantId);
        expect(user.roleId).toBe(props.roleId);
        expect(user.createdAt).toEqual(props.createdAt);
        expect(user.updatedAt).toEqual(props.updatedAt);
        expect(user.suspendedAt).toBeNull();
        expect(user.status).toBe(USER_STATUS.ACTIVE);
    });

    it("should update the provided fields successfully", () => {
        const user = User.create(createProps());
        user.update({ firstName: "Jane", lastName: "Smith", roleId: "new-role-id" });
        expect(user.firstName).toBe("Jane");
        expect(user.lastName).toBe("Smith");
        expect(user.roleId).toBe("new-role-id");
        expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it("should update only first name", () => {
        const user = User.create(createProps());
        user.update({ firstName: "Jane" });
        expect(user.firstName).toBe("Jane");
        expect(user.lastName).toBe("Vargas");
        expect(user.roleId).toBe("role-id");
    });

    it("should update only last name", () => {
        const user = User.create(createProps());
        user.update({ lastName: "Smith" });
        expect(user.firstName).toBe("Omar");
        expect(user.lastName).toBe("Smith");
        expect(user.roleId).toBe("role-id");
    });

    it("should update only role", () => {
        const user = User.create(createProps());
        user.update({ roleId: "new-role-id" });
        expect(user.firstName).toBe("Omar");
        expect(user.lastName).toBe("Vargas");
        expect(user.roleId).toBe("new-role-id");
    });

    it("should throw InvalidFirstNameError when updating first name with an empty value", () => {
        const user = User.create(createProps());
        expect(() => {
            user.update({ firstName: "" });
        }).toThrow(InvalidFirstNameError);
    });

    it("should throw InvalidLastNameError when updating last name with an empty value", () => {
        const user = User.create(createProps());
        expect(() => {
            user.update({ lastName: "" });
        }).toThrow(InvalidLastNameError);
    });
});
