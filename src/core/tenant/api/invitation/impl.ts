import { Injectable } from "@nestjs/common";

import { ConsumeInvitationOhsUseCase, ValidateInvitationOhsUseCase } from "../../application/use-cases-ohs";
import { InvitationApi } from "./contract";
import type { ConsumeInvitationResultDto, InvitationResultDto } from "./result.dto";

@Injectable()
export class InvitationApiImpl extends InvitationApi {
    constructor(
        private readonly consumeInvitationOhsUseCase: ConsumeInvitationOhsUseCase,
        private readonly validateInvitationOhsUseCase: ValidateInvitationOhsUseCase,
    ) {
        super();
    }

    public async validate(token: string): Promise<InvitationResultDto> {
        return await this.validateInvitationOhsUseCase.execute(token);
    }

    public async consume(token: string): Promise<ConsumeInvitationResultDto> {
        return await this.consumeInvitationOhsUseCase.execute(token);
    }
}
