import type { AuditRecordInput } from "../types";

export abstract class AuditRecorder {
    public abstract record(input: AuditRecordInput): void;
}
