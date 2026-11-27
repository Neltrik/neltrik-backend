import { Injectable } from "@nestjs/common";

import { CreateMembershipOhsUseCase } from "../../application/use-cases-ohs";
import { MembershipApi } from "./contract";
import { type MembershipResultDto } from "./result.dto";

@Injectable()
export class MembershipApiImpl extends MembershipApi {
    constructor(private readonly createMembershipOhsUseCase: CreateMembershipOhsUseCase) {
        super();
    }

    public async create(input: MembershipResultDto): Promise<void> {
        await this.createMembershipOhsUseCase.execute(input);
    }
}
