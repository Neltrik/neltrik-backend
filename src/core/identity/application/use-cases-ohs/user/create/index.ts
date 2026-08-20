import { Injectable } from "@nestjs/common";

import { IdGenerator } from "@/shared/id-generator";

import { User } from "../../../../domain/entities";
import { EmailAlreadyExistsError } from "../../../../domain/errors";
import { UserRepository } from "../../../../domain/interfaces";
import { Email } from "../../../../domain/value-objects";
import { RegisterUserOhsInput } from "./input";
import { RegisterUserOhsOutput } from "./output";

@Injectable()
export class RegisterUserOhsUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly idGenerator: IdGenerator,
    ) {}

    public async execute(input: RegisterUserOhsInput): Promise<RegisterUserOhsOutput> {
        const email = Email.create(input.email);
        const exists = await this.userRepository.existsByEmail(email);
        if (exists) {
            throw new EmailAlreadyExistsError();
        }
        const now = new Date();
        const user = User.create({
            id: this.idGenerator.generate(),
            firstName: input.firstName,
            lastName: input.lastName,
            email,
            tenantId: input.tenantId,
            roleId: input.roleId,
            createdAt: now,
            updatedAt: now,
            suspendedAt: null,
        });
        await this.userRepository.create(user);
        return { id: user.id };
    }
}

export type { RegisterUserOhsInput };
