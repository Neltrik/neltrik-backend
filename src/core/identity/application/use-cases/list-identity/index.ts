import { Injectable } from "@nestjs/common";

import type { User } from "../../../domain/entities";
import { UserRepository } from "../../../domain/interfaces";
import type { GetUsersInput } from "./input";

@Injectable()
export class GetUsersUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    public execute(input: GetUsersInput): Promise<User[]> {
        return this.userRepository.list(input.tenantId);
    }
}

export type { GetUsersInput };
