import { Injectable } from "@nestjs/common";

import { GetUserByIdOhsUseCase, RegisterUserOhsUseCase } from "../../application/use-cases-ohs";
import { UserApi } from "./contract";
import type { RegisterUserRequestDto, RegisterUserResultDto } from "./result.dto";

@Injectable()
export class UserApiImpl extends UserApi {
    constructor(
        private readonly registerUserOhsUseCase: RegisterUserOhsUseCase,
        private readonly getUserByIdOhsUseCase: GetUserByIdOhsUseCase,
    ) {
        super();
    }

    public async create(input: RegisterUserRequestDto): Promise<RegisterUserResultDto> {
        const user = await this.registerUserOhsUseCase.execute(input);
        return { id: user.id };
    }

    public async validateUserById(userId: string): Promise<void> {
        await this.getUserByIdOhsUseCase.execute(userId);
    }
}
