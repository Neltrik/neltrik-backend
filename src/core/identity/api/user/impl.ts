import { Injectable } from "@nestjs/common";

import { GetUserByIdOhsUseCase, ValidateUserByEmailOhsUseCase } from "../../application/use-cases-ohs";
import { Email } from "../../domain/value-objects";
import { UserApi } from "./contract";

@Injectable()
export class UserApiImpl extends UserApi {
    constructor(
        private readonly validateUserByEmailOhsUseCase: ValidateUserByEmailOhsUseCase,
        private readonly getUserByIdOhsUseCase: GetUserByIdOhsUseCase,
    ) {
        super();
    }

    public async validateUserById(userId: string): Promise<void> {
        await this.getUserByIdOhsUseCase.execute(userId);
    }

    public async validateEmail(email: string): Promise<void> {
        await this.validateUserByEmailOhsUseCase.execute(Email.create(email));
    }
}
