import {
    CompanyAlreadyActiveError,
    CompanyAlreadySuspendedError,
    InvalidCompanyNameError,
    InvalidCompanyStatusError,
} from "../../errors";
import { COMPANY_STATUS, COMPANY_STATUSES, type CompanyProps, type CompanyStatus } from "../../types";
import { CompanySlug } from "../../value-objects";

export class Company {
    private props: CompanyProps;

    private constructor(props: CompanyProps) {
        this.ensureNameIsValid(props.name);
        this.ensureStatusIsValid(props.status);
        this.props = props;
    }

    public static create(props: Omit<CompanyProps, "status" | "updatedAt">): Company {
        return new Company({ ...props, status: COMPANY_STATUS.ACTIVE, updatedAt: props.createdAt });
    }

    public static restore(props: CompanyProps): Company {
        return new Company(props);
    }

    private ensureNameIsValid(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new InvalidCompanyNameError();
        }
        if (name.length > 255) {
            throw new InvalidCompanyNameError();
        }
    }

    private ensureStatusIsValid(status: CompanyStatus): void {
        if (!COMPANY_STATUSES.includes(status)) {
            throw new InvalidCompanyStatusError();
        }
    }

    public isActive(): boolean {
        return this.props.status === COMPANY_STATUS.ACTIVE;
    }

    public isSuspended(): boolean {
        return this.props.status === COMPANY_STATUS.SUSPENDED;
    }

    public canBeSuspended(): boolean {
        return this.isActive();
    }

    public canBeReactivated(): boolean {
        return this.isSuspended();
    }

    public suspend(): void {
        if (this.isSuspended()) {
            throw new CompanyAlreadySuspendedError();
        }
        this.props.status = COMPANY_STATUS.SUSPENDED;
        this.props.updatedAt = new Date();
    }

    public reactivate(): void {
        if (this.isActive()) {
            throw new CompanyAlreadyActiveError();
        }
        this.props.status = COMPANY_STATUS.ACTIVE;
        this.props.updatedAt = new Date();
    }

    public rename(name: string): void {
        this.ensureNameIsValid(name);
        this.props.name = name;
        this.props.updatedAt = new Date();
    }

    public changeSlug(slug: string): void {
        const slugVO = CompanySlug.create(slug);
        this.props.slug = slugVO.value;
        this.props.updatedAt = new Date();
    }

    public get id(): string {
        return this.props.id;
    }

    public get tenantId(): string {
        return this.props.tenantId;
    }

    public get name(): string {
        return this.props.name;
    }

    public get slug(): string {
        return this.props.slug;
    }

    public get status(): CompanyStatus {
        return this.props.status;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
