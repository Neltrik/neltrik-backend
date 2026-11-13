import {
    InvalidMembershipStatusError,
    InvalidMembershipTransitionError,
    MembershipAlreadyRevokedError,
} from "../../errors";
import { MEMBERSHIP_STATUS, MEMBERSHIP_STATUSES, type MembershipProps, type MembershipStatus } from "../../types";

export class Membership {
    private props: MembershipProps;

    private constructor(props: MembershipProps) {
        this.ensureStatusIsValid(props.status);
        this.props = props;
    }

    public static create(props: Omit<MembershipProps, "status" | "updatedAt">): Membership {
        return new Membership({ ...props, status: MEMBERSHIP_STATUS.PENDING, updatedAt: props.createdAt });
    }

    public static restore(props: MembershipProps): Membership {
        return new Membership(props);
    }

    private ensureStatusIsValid(status: MembershipStatus): void {
        if (!MEMBERSHIP_STATUSES.includes(status)) {
            throw new InvalidMembershipStatusError();
        }
    }

    private ensureCanAccept(): void {
        if (this.props.status !== MEMBERSHIP_STATUS.PENDING) {
            throw new InvalidMembershipTransitionError(this.props.status);
        }
    }

    private ensureCanSuspend(): void {
        if (this.props.status !== MEMBERSHIP_STATUS.ACTIVE) {
            throw new InvalidMembershipTransitionError(this.props.status);
        }
    }

    private ensureCanReactivate(): void {
        if (this.props.status !== MEMBERSHIP_STATUS.SUSPENDED) {
            throw new InvalidMembershipTransitionError(this.props.status);
        }
    }

    private ensureCanRevoke(): void {
        if (this.props.status === MEMBERSHIP_STATUS.REVOKED) {
            throw new MembershipAlreadyRevokedError();
        }
    }

    public isPending(): boolean {
        return this.props.status === MEMBERSHIP_STATUS.PENDING;
    }

    public isActive(): boolean {
        return this.props.status === MEMBERSHIP_STATUS.ACTIVE;
    }

    public isSuspended(): boolean {
        return this.props.status === MEMBERSHIP_STATUS.SUSPENDED;
    }

    public isRevoked(): boolean {
        return this.props.status === MEMBERSHIP_STATUS.REVOKED;
    }

    public canBeAccepted(): boolean {
        return this.isPending();
    }

    public canBeSuspended(): boolean {
        return this.isActive();
    }

    public canBeReactivated(): boolean {
        return this.isSuspended();
    }

    public canBeRevoked(): boolean {
        return !this.isRevoked();
    }

    public canChangeRole(): boolean {
        return this.isActive();
    }

    public accept(): void {
        this.ensureCanAccept();
        this.props.status = MEMBERSHIP_STATUS.ACTIVE;
        this.props.updatedAt = new Date();
    }

    public suspend(): void {
        this.ensureCanSuspend();
        this.props.status = MEMBERSHIP_STATUS.SUSPENDED;
        this.props.updatedAt = new Date();
    }

    public reactivate(): void {
        this.ensureCanReactivate();
        this.props.status = MEMBERSHIP_STATUS.ACTIVE;
        this.props.updatedAt = new Date();
    }

    public revoke(): void {
        this.ensureCanRevoke();
        this.props.status = MEMBERSHIP_STATUS.REVOKED;
        this.props.updatedAt = new Date();
    }

    public changeRole(roleId: string): void {
        if (!this.canChangeRole()) {
            throw new InvalidMembershipTransitionError(this.props.status);
        }
        this.props.roleId = roleId;
        this.props.updatedAt = new Date();
    }

    public get id(): string {
        return this.props.id;
    }

    public get tenantId(): string {
        return this.props.tenantId;
    }

    public get userId(): string {
        return this.props.userId;
    }

    public get companyId(): string {
        return this.props.companyId;
    }

    public get roleId(): string {
        return this.props.roleId;
    }

    public get status(): MembershipStatus {
        return this.props.status;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
