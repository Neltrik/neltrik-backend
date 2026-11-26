import type { CreateMembershipOhsInput } from "../../application/use-cases-ohs";

export abstract class MembershipApi {
    public abstract create(input: CreateMembershipOhsInput): Promise<void>;
}
