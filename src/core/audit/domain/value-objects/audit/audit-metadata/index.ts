import { InvalidAuditMetadataError } from "../../../errors";

export class AuditMetadata {
    private constructor(private readonly metadata: Record<string, unknown>) {}

    public static create(value: Record<string, unknown>): AuditMetadata {
        this.ensureIsObject(value);
        this.ensureIsJsonValue(value);
        return new AuditMetadata(AuditMetadata.clone(value));
    }

    private static ensureIsObject(value: unknown): void {
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
            throw new InvalidAuditMetadataError();
        }
    }

    private static ensureIsJsonValue(value: unknown): void {
        if (value === null || typeof value === "string" || typeof value === "boolean") {
            return;
        }
        if (typeof value === "number") {
            if (!Number.isFinite(value)) {
                throw new InvalidAuditMetadataError();
            }
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((item) => this.ensureIsJsonValue(item));
            return;
        }
        if (typeof value === "object") {
            Object.values(value).forEach((item) => this.ensureIsJsonValue(item));
            return;
        }
        throw new InvalidAuditMetadataError();
    }

    private static clone(value: Record<string, unknown>): Record<string, unknown> {
        return structuredClone(value);
    }

    public get<T = unknown>(key: string): T | undefined {
        return this.metadata[key] as T | undefined;
    }

    public has(key: string): boolean {
        return Object.prototype.hasOwnProperty.call(this.metadata, key);
    }

    public toJSON(): Record<string, unknown> {
        return AuditMetadata.clone(this.metadata);
    }
}
