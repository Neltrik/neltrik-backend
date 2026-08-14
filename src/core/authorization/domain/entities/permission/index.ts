import { InvalidPermissionCodeError, InvalidPermissionDescriptionError } from "../../errors";
import type { PermissionProps, PermissionScope } from "../../types";

export class Permission {
    private readonly props: PermissionProps;

    private constructor(props: PermissionProps) {
        this.ensureCodeIsNotEmpty(props.code);
        this.ensureDescriptionIsNotEmpty(props.description);
        this.props = props;
    }

    public static create(props: PermissionProps): Permission {
        return new Permission(props);
    }

    public static restore(props: PermissionProps): Permission {
        return new Permission(props);
    }

    public update(props: { description?: string }): void {
        if (props.description !== undefined) {
            this.ensureDescriptionIsNotEmpty(props.description);
            this.props.description = props.description;
        }
        this.props.updatedAt = new Date();
    }

    private ensureCodeIsNotEmpty(code: string): void {
        if (code.trim() === "") {
            throw new InvalidPermissionCodeError();
        }
    }

    private ensureDescriptionIsNotEmpty(description: string): void {
        if (description.trim() === "") {
            throw new InvalidPermissionDescriptionError();
        }
    }

    public get id(): string {
        return this.props.id;
    }

    public get code(): string {
        return this.props.code;
    }

    public get description(): string {
        return this.props.description;
    }

    public get scope(): PermissionScope {
        return this.props.scope;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
