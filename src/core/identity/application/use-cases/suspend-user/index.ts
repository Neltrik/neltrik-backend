import { Injectable } from "@nestjs/common";

import { AuthorizationPolicyApi } from "@/core/authorization/api";
import { UnauthorizedError } from "@/shared/errors";

import { UserNotFoundError } from "../../../domain/errors";
import { UserRepository } from "../../../domain/interfaces";
import { SuspendUserInput } from "./input";

@Injectable()
export class SuspendUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly authorizationPolicyApi: AuthorizationPolicyApi,
    ) {}

    public async execute(input: SuspendUserInput): Promise<void> {
        if (!input.actorUserId) {
            throw new UnauthorizedError();
        }
        const actor = await this.userRepository.get(input.actorUserId);
        if (!actor) {
            throw new UserNotFoundError();
        }
        const target = await this.userRepository.get(input.targetUserId);
        if (!target) {
            throw new UserNotFoundError();
        }
        await this.authorizationPolicyApi.canSuspend({ actorRoleId: actor.roleId, targetRoleId: target.roleId });
        target.suspend();
        await this.userRepository.update(target);
    }
}
