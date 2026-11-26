import { Injectable } from "@nestjs/common";

import { type CreateMembershipOhsInput, CreateMembershipOhsUseCase } from "../../application/use-cases-ohs";
import { MembershipApi } from "./contract";

@Injectable()
export class MembershipApiImpl extends MembershipApi {
    constructor(private readonly createMembershipOhsUseCase: CreateMembershipOhsUseCase) {
        super();
    }

    public async create(input: CreateMembershipOhsInput): Promise<void> {
        await this.createMembershipOhsUseCase.execute(input);
    }
}
