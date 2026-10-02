import { FileQuotaExceededError, InvalidQuotaLimitError, InvalidQuotaUsageError } from "../../errors";
import { type FileQuotaProps } from "../../types";

const NEAR_LIMIT_THRESHOLD = 0.8;

export class FileQuota {
    private props: FileQuotaProps;

    private constructor(props: FileQuotaProps) {
        this.ensureLimitIsValid(props.limitBytes);
        this.ensureUsageIsValid(props.usedBytes);
        this.props = props;
    }

    public static create(props: Omit<FileQuotaProps, "usedBytes" | "updatedAt">): FileQuota {
        return new FileQuota({ ...props, usedBytes: 0, updatedAt: props.createdAt });
    }

    public static restore(props: FileQuotaProps): FileQuota {
        return new FileQuota(props);
    }

    private ensureLimitIsValid(limitBytes: number): void {
        if (!Number.isInteger(limitBytes) || limitBytes <= 0) {
            throw new InvalidQuotaLimitError();
        }
    }

    private ensureUsageIsValid(usedBytes: number): void {
        if (!Number.isInteger(usedBytes) || usedBytes < 0) {
            throw new InvalidQuotaUsageError();
        }
    }

    private ensureSizeIsValid(size: number): void {
        if (!Number.isInteger(size) || size <= 0) {
            throw new InvalidQuotaUsageError();
        }
    }

    public increment(size: number): void {
        this.ensureSizeIsValid(size);
        if (!this.canAccommodate(size)) {
            throw new FileQuotaExceededError();
        }
        this.props.usedBytes += size;
        this.props.updatedAt = new Date();
    }

    public decrement(size: number): void {
        this.ensureSizeIsValid(size);
        if (this.props.usedBytes - size < 0) {
            throw new InvalidQuotaUsageError();
        }
        this.props.usedBytes -= size;
        this.props.updatedAt = new Date();
    }

    public adjustLimit(newLimitBytes: number): void {
        this.ensureLimitIsValid(newLimitBytes);
        this.props.limitBytes = newLimitBytes;
        this.props.updatedAt = new Date();
    }

    public canAccommodate(size: number): boolean {
        return this.props.usedBytes + size <= this.props.limitBytes;
    }

    public isNearLimit(threshold: number = NEAR_LIMIT_THRESHOLD): boolean {
        return this.props.usedBytes >= this.props.limitBytes * threshold;
    }

    public isOverLimit(): boolean {
        return this.props.usedBytes > this.props.limitBytes;
    }

    public getAvailableBytes(): number {
        return this.props.limitBytes - this.props.usedBytes;
    }

    public get id(): string {
        return this.props.id;
    }

    public get tenantId(): string {
        return this.props.tenantId;
    }

    public get limitBytes(): number {
        return this.props.limitBytes;
    }

    public get usedBytes(): number {
        return this.props.usedBytes;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
