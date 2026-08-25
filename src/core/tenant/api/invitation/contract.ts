import type { ConsumeInvitationResultDto, InvitationResultDto } from "./result.dto";

export abstract class InvitationApi {
    public abstract validate(token: string): Promise<InvitationResultDto>;
    public abstract consume(token: string): Promise<ConsumeInvitationResultDto>;
}
