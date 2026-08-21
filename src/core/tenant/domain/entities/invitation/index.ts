import {
    InvalidInvitationStatusError,
    InvitationAlreadyRevokedError,
    InvitationAlreadyUsedError,
    InvitationExpiredError,
} from "../../errors";
import { INVITATION_STATUS, type InvitationProps, type InvitationStatus } from "../../types";
import type { ExpirationDate, Recipient, Token } from "../../value-objects";

export class Invitation {
    private readonly props: InvitationProps;

    private constructor(props: InvitationProps) {
        this.ensureStatusIsValid(props.status);
        this.props = props;
        this.updateExpiredStatusIfNeeded(props);
    }

    public static create(props: Omit<InvitationProps, "status">): Invitation {
        return new Invitation({ ...props, status: INVITATION_STATUS.PENDING });
    }

    public static restore(props: InvitationProps): Invitation {
        return new Invitation(props);
    }

    public use(): void {
        this.ensureIsPending();
        this.ensureIsNotExpired();
        this.props.status = INVITATION_STATUS.USED;
        this.props.usedAt = new Date();
        this.props.updatedAt = new Date();
    }

    public revoke(): void {
        this.ensureIsPending();
        this.ensureIsNotExpired();
        this.ensureIsNotRevoked();
        this.props.status = INVITATION_STATUS.REVOKED;
        this.props.revokedAt = new Date();
        this.props.updatedAt = new Date();
    }

    public isPending(): boolean {
        return this.props.status === INVITATION_STATUS.PENDING;
    }

    public isExpired(): boolean {
        return this.props.expirationDate.isExpired();
    }

    public isUsed(): boolean {
        return this.props.status === INVITATION_STATUS.USED;
    }

    public isRevoked(): boolean {
        return this.props.status === INVITATION_STATUS.REVOKED;
    }

    private ensureStatusIsValid(status: InvitationStatus): void {
        const validStatuses = Object.values(INVITATION_STATUS);
        if (!validStatuses.includes(status)) {
            throw new InvalidInvitationStatusError();
        }
    }

    private ensureIsNotExpired(): void {
        if (this.isExpired()) {
            throw new InvitationExpiredError();
        }
    }

    private ensureIsPending(): void {
        if (this.isPending()) {
            return;
        }
        if (this.isUsed()) {
            throw new InvitationAlreadyUsedError();
        }
        if (this.isRevoked()) {
            throw new InvitationAlreadyRevokedError();
        }
    }

    private ensureIsNotRevoked(): void {
        if (this.isRevoked()) {
            throw new InvitationAlreadyRevokedError();
        }
    }

    private updateExpiredStatusIfNeeded(props: InvitationProps): void {
        if (props.expirationDate.isExpired() && props.status === INVITATION_STATUS.PENDING) {
            props.status = INVITATION_STATUS.EXPIRED;
        }
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

    public get recipient(): Recipient {
        return this.props.recipient;
    }

    public get token(): Token {
        return this.props.token;
    }

    public get expirationDate(): ExpirationDate {
        return this.props.expirationDate;
    }

    public get status(): InvitationStatus {
        return this.props.status;
    }

    public get usedAt(): Date | null {
        return this.props.usedAt;
    }

    public get revokedAt(): Date | null {
        return this.props.revokedAt;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
