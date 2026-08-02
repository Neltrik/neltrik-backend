import { Injectable } from "@nestjs/common";

import { UserNotFoundError } from "../../../domain/errors";
import { UserRepository } from "../../../domain/interfaces";

@Injectable()
export class SuspendUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    public async execute(id: string): Promise<void> {
        const user = await this.userRepository.get(id);
        if (!user) {
            throw new UserNotFoundError();
        }
        user.suspend();
        await this.userRepository.update(user);
    }
}
