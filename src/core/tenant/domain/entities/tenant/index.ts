import { InvalidTenantNameError, InvalidTenantSlugError } from "../../errors";
import type { TenantState, TenantStatus } from "../../types";
import { TENANT_STATUS } from "../../types";

export class Tenant {
    private readonly props: TenantState;

    private constructor(props: TenantState) {
        this.ensureNameIsNotEmpty(props.name);
        this.ensureSlugIsNotEmpty(props.slug);
        this.props = props;
    }

    public static create(props: Omit<TenantState, "status">): Tenant {
        return new Tenant({ ...props, status: TENANT_STATUS.ACTIVE });
    }

    public static restore(props: TenantState): Tenant {
        return new Tenant(props);
    }

    public update(name: string): void {
        this.ensureNameIsNotEmpty(name);
        this.props.name = name;
        this.props.updatedAt = new Date();
    }

    private ensureNameIsNotEmpty(name: string): void {
        if (name.trim() === "") {
            throw new InvalidTenantNameError();
        }
    }

    private ensureSlugIsNotEmpty(slug: string): void {
        if (slug.trim() === "") {
            throw new InvalidTenantSlugError();
        }
    }

    public get id(): string {
        return this.props.id;
    }

    public get name(): string {
        return this.props.name;
    }

    public get slug(): string {
        return this.props.slug;
    }

    public get status(): TenantStatus {
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
