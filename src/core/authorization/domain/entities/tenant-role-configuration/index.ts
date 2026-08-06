import type { TenantRoleConfigurationProps } from "../../types";

export class TenantRoleConfiguration {
    private readonly props: TenantRoleConfigurationProps;

    private constructor(props: TenantRoleConfigurationProps) {
        this.props = props;
    }

    public static create(props: TenantRoleConfigurationProps): TenantRoleConfiguration {
        return new TenantRoleConfiguration(props);
    }

    public static restore(props: TenantRoleConfigurationProps): TenantRoleConfiguration {
        return new TenantRoleConfiguration(props);
    }

    public update(props: { displayName?: TenantRoleConfigurationProps["displayName"] }): void {
        if (props.displayName !== undefined) {
            this.props.displayName = props.displayName;
        }
        this.props.updatedAt = new Date();
    }

    public get id(): string {
        return this.props.id;
    }

    public get tenantId(): string {
        return this.props.tenantId;
    }

    public get roleId(): string {
        return this.props.roleId;
    }

    public get displayName() {
        return this.props.displayName;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
