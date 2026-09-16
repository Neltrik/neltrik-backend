import { InvalidAuditMetadataError } from "../../../errors";

type JsonArray = JsonValue[];
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject {
    [key: string]: JsonValue;
}

export class AuditMetadata {
    private constructor(private readonly metadata: JsonObject) {}

    public static create(value: unknown): AuditMetadata {
        this.ensureIsObject(value);
        this.ensureIsJsonValue(value);
        return new AuditMetadata(AuditMetadata.clone(value));
    }

    private static ensureIsObject(value: unknown): asserts value is JsonObject {
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
            value.forEach((item) => AuditMetadata.ensureIsJsonValue(item));
            return;
        }
        if (typeof value === "object") {
            Object.values(value).forEach((item) => AuditMetadata.ensureIsJsonValue(item));
            return;
        }
        throw new InvalidAuditMetadataError();
    }

    private static clone(value: JsonObject): JsonObject {
        return structuredClone(value);
    }

    public get<T = unknown>(key: string): T | undefined {
        return this.metadata[key] as T | undefined;
    }

    public has(key: string): boolean {
        return Object.prototype.hasOwnProperty.call(this.metadata, key);
    }

    public toJSON(): JsonObject {
        return AuditMetadata.clone(this.metadata);
    }

    public keys(): string[] {
        return Object.keys(this.metadata);
    }

    public isEmpty(): boolean {
        return Object.keys(this.metadata).length === 0;
    }

    public equals(other: AuditMetadata): boolean {
        return JSON.stringify(this.metadata) === JSON.stringify(other.metadata);
    }
}
