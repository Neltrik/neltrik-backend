import { InvalidFirstNameError, InvalidLastNameError } from "../../errors";
import type { UserState, UserStatus } from "../../types";
import { USER_STATUS } from "../../types";
import type { Email } from "../../value-objects/email";

export class User {
    private readonly props: UserState;

    private constructor(props: UserState) {
        this.ensureFirstNameIsNotEmpty(props.firstName);
        this.ensureLastNameIsNotEmpty(props.lastName);
        this.props = props;
    }

    public static create(props: Omit<UserState, "status">): User {
        return new User({
            ...props,
            status: USER_STATUS.ACTIVE,
        });
    }

    public static restore(props: UserState): User {
        return new User(props);
    }

    public update(firstName: string, lastName: string, roleId: string): void {
        this.ensureFirstNameIsNotEmpty(firstName);
        this.ensureLastNameIsNotEmpty(lastName);
        this.props.firstName = firstName;
        this.props.lastName = lastName;
        this.props.roleId = roleId;
        this.props.updatedAt = new Date();
    }

    private ensureFirstNameIsNotEmpty(firstName: string): void {
        if (firstName.trim() === "") {
            throw new InvalidFirstNameError();
        }
    }

    private ensureLastNameIsNotEmpty(lastName: string): void {
        if (lastName.trim() === "") {
            throw new InvalidLastNameError();
        }
    }

    public get id(): string {
        return this.props.id;
    }

    public get firstName(): string {
        return this.props.firstName;
    }

    public get lastName(): string {
        return this.props.lastName;
    }

    public get email(): Email {
        return this.props.email;
    }

    public get tenantId(): string {
        return this.props.tenantId;
    }

    public get roleId(): string {
        return this.props.roleId;
    }

    public get status(): UserStatus {
        return this.props.status;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }

    public get suspendedAt(): Date | null {
        return this.props.suspendedAt;
    }
}
