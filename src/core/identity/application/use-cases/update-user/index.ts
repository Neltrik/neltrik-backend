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
        const update: {
            firstName?: string;
            lastName?: string;
            roleId?: string;
        } = {};
        if (!user) {
            throw new UserNotFoundError();
        }
        if (input.firstName !== undefined) {
            update.firstName = input.firstName;
        }
        if (input.lastName !== undefined) {
            update.lastName = input.lastName;
        }
        if (input.roleId !== undefined) {
            update.roleId = input.roleId;
        }
        user.update(update);
        await this.userRepository.update(user);
        return { id: user.id };
    }
}

export type { UpdateUserInput };
