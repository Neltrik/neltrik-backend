import { type CanSuspendUserPolicyInput } from "../../application/use-cases-ohs";

export abstract class AuthorizationPolicyApi {
    public abstract canSuspend(input: CanSuspendUserPolicyInput): Promise<void>;
}
