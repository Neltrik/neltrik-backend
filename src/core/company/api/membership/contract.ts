import type { MembershipResultDto } from "./result.dto";

export abstract class MembershipApi {
    public abstract create(input: MembershipResultDto): Promise<void>;
}
