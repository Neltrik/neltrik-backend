import { Injectable } from "@nestjs/common";

import { UserNotFoundError } from "../../../../domain/errors";
import { UserRepository } from "../../../../domain/interfaces";
import { GetUserByIdOhsOutput } from "./output";

@Injectable()
export class GetUserByIdOhsUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    public async execute(userId: string): Promise<GetUserByIdOhsOutput> {
        const user = await this.userRepository.get(userId);
        if (!user) {
            throw new UserNotFoundError();
        }
        return {
            id: user.id,
            roleId: user.roleId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            tenantId: user.tenantId,
            status: user.status,
            suspendedAt: user.suspendedAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
