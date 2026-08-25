import { Injectable } from "@nestjs/common";

import { UserNotFoundError } from "../../../../domain/errors";
import { UserRepository } from "../../../../domain/interfaces";
import { DeleteUserOhsOutput } from "./output";

@Injectable()
export class DeleteUserOhsUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    public async execute(userId: string): Promise<DeleteUserOhsOutput> {
        const user = await this.userRepository.get(userId);
        if (!user) {
            throw new UserNotFoundError();
        }
        await this.userRepository.delete(userId);
        return { id: user.id };
    }
}
