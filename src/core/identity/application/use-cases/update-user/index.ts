import { Injectable } from "@nestjs/common";

import { UserNotFoundError } from "../../../domain/errors";
import { UserRepository } from "../../../domain/interfaces";
import { UpdateUserInput } from "./input";
import { UpdateUserOutput } from "./output";

@Injectable()
export class UpdateUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    public async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
        const user = await this.userRepository.get(input.id);
        if (!user) {
            throw new UserNotFoundError();
        }
        user.update(input.firstName, input.lastName, input.roleId);
        await this.userRepository.update(user);
        return { id: user.id };
    }
}

export type { UpdateUserInput };
