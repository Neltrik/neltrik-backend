import { Injectable } from "@nestjs/common";

import { type CanSuspendUserPolicyInput, CanSuspendUserPolicyOhsUseCase } from "../../application/use-cases-ohs";
import { AuthorizationPolicyApi } from "./contract";

@Injectable()
export class AuthorizationPolicyApiImpl extends AuthorizationPolicyApi {
    constructor(private readonly canSuspendUserPolicyOhsUseCase: CanSuspendUserPolicyOhsUseCase) {
        super();
    }

    public async canSuspend(input: CanSuspendUserPolicyInput): Promise<void> {
        await this.canSuspendUserPolicyOhsUseCase.execute(input);
    }
}
