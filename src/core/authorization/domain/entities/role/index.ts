import { InvalidRoleCodeError, InvalidRoleDescriptionError, InvalidRoleDisplayNameError } from "../../errors";
import type { RoleProps } from "../../types";

export class Role {
    private readonly props: RoleProps;

    private constructor(props: RoleProps) {
        this.ensureCodeIsNotEmpty(props.code);
        this.ensureDisplayNameIsNotEmpty(props.defaultDisplayName);
        this.ensureDescriptionIsNotEmpty(props.description);
        this.props = props;
    }

    public static create(props: RoleProps): Role {
        return new Role(props);
    }

    public static restore(props: RoleProps): Role {
        return new Role(props);
    }

    public update(props: { defaultDisplayName?: string; description?: string }): void {
        if (props.defaultDisplayName !== undefined) {
            this.ensureDisplayNameIsNotEmpty(props.defaultDisplayName);
            this.props.defaultDisplayName = props.defaultDisplayName;
        }
        if (props.description !== undefined) {
            this.ensureDescriptionIsNotEmpty(props.description);
            this.props.description = props.description;
        }
        this.props.updatedAt = new Date();
    }

    public assignPermissions(permissionIds: string[]): void {
        this.props.permissionIds = [...new Set([...this.props.permissionIds, ...permissionIds])];
    }

    public removePermissions(permissionIds: string[]): void {
        const permissionsToRemove = new Set(permissionIds);
        this.props.permissionIds = this.props.permissionIds.filter(
            (permissionId) => !permissionsToRemove.has(permissionId),
        );
    }

    private ensureCodeIsNotEmpty(code: string): void {
        if (code.trim() === "") {
            throw new InvalidRoleCodeError();
        }
    }

    private ensureDisplayNameIsNotEmpty(displayName: string): void {
        if (displayName.trim() === "") {
            throw new InvalidRoleDisplayNameError();
        }
    }

    private ensureDescriptionIsNotEmpty(description: string): void {
        if (description.trim() === "") {
            throw new InvalidRoleDescriptionError();
        }
    }

    public get id(): string {
        return this.props.id;
    }

    public get code(): string {
        return this.props.code;
    }

    public get defaultDisplayName(): string {
        return this.props.defaultDisplayName;
    }

    public get description(): string {
        return this.props.description;
    }

    public get permissionIds(): string[] {
        return [...this.props.permissionIds];
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
