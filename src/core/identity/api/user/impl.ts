import { Injectable } from "@nestjs/common";

import { DeleteUserOhsUseCase, GetUserByIdOhsUseCase, RegisterUserOhsUseCase } from "../../application/use-cases-ohs";
import { UserApi } from "./contract";
import type { DeleteUserResultDto, RegisterUserRequestDto, RegisterUserResultDto } from "./result.dto";

@Injectable()
export class UserApiImpl extends UserApi {
    constructor(
        private readonly deleteUserOhsUseCase: DeleteUserOhsUseCase,
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

    public async delete(userId: string): Promise<DeleteUserResultDto> {
        return await this.deleteUserOhsUseCase.execute(userId);
    }
}
