import { Injectable } from "@nestjs/common";

import { UserNotFoundError } from "../../../../domain/errors";
import { UserRepository } from "../../../../domain/interfaces";
import { Email } from "../../../../domain/value-objects";

@Injectable()
export class ValidateUserByEmailOhsUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    public async execute(email: Email): Promise<void> {
        const exists = await this.userRepository.existsByEmail(email);
        if (!exists) {
            throw new UserNotFoundError();
        }
    }
}
