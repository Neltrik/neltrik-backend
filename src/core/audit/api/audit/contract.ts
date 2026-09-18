import { type CreateAuditEventInput } from "../../application/use-cases-ohs";

export abstract class AuditApi {
    public abstract record(input: CreateAuditEventInput): void;
    public abstract recordWithFn<T>(input: Omit<CreateAuditEventInput, "status">, fn: () => Promise<T>): Promise<T>;
}
