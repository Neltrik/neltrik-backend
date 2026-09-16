import { EmptyActionError, EmptyResourceError } from "../../errors";
import type { AuditEventProps, AuditStatus } from "../../types";
import type { AuditMetadata, IpAddress } from "../../value-objects";

export class AuditEvent {
    private readonly props: AuditEventProps;

    private constructor(props: AuditEventProps) {
        this.ensureActionIsNotEmpty(props.action);
        this.ensureResourceIsNotEmpty(props.resource);
        this.props = props;
    }

    public static create(props: AuditEventProps): AuditEvent {
        return new AuditEvent(props);
    }

    public static restore(props: AuditEventProps): AuditEvent {
        return new AuditEvent(props);
    }

    private ensureActionIsNotEmpty(action: string): void {
        if (!action || action.trim() === "") {
            throw new EmptyActionError();
        }
    }

    private ensureResourceIsNotEmpty(resource: string): void {
        if (!resource || resource.trim() === "") {
            throw new EmptyResourceError();
        }
    }

    public get id(): string {
        return this.props.id;
    }

    public get userId(): string | null {
        return this.props.userId;
    }

    public get userEmail(): string | null {
        return this.props.userEmail;
    }

    public get tenantId(): string | null {
        return this.props.tenantId;
    }

    public get action(): string {
        return this.props.action;
    }

    public get resource(): string {
        return this.props.resource;
    }

    public get resourceId(): string | null {
        return this.props.resourceId;
    }

    public get status(): AuditStatus {
        return this.props.status;
    }

    public get metadata(): AuditMetadata {
        return this.props.metadata;
    }

    public get ipAddress(): IpAddress | null {
        return this.props.ipAddress;
    }

    public get userAgent(): string | null {
        return this.props.userAgent;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }
}
