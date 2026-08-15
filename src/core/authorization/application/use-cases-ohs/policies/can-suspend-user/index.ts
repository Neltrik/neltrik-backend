import { Injectable } from "@nestjs/common";

import { CannotSuspendHigherRoleError, RoleNotFoundError } from "../../../../domain/errors";
import { RoleRepository } from "../../../../domain/interfaces";
import { UserSuspensionPolicy } from "../../../../domain/policies";
import { CanSuspendUserPolicyInput } from "./input";

@Injectable()
export class CanSuspendUserPolicyOhsUseCase {
    constructor(private readonly roleRepository: RoleRepository) {}

    public async execute(input: CanSuspendUserPolicyInput): Promise<void> {
        const actorRole = await this.roleRepository.get(input.actorRoleId);
        if (!actorRole) {
            throw new RoleNotFoundError();
        }
        const targetRole = await this.roleRepository.get(input.targetRoleId);
        if (!targetRole) {
            throw new RoleNotFoundError();
        }
        const canSuspend = UserSuspensionPolicy.canSuspend(actorRole.code, targetRole.code);
        if (!canSuspend) {
            throw new CannotSuspendHigherRoleError();
        }
    }
}

export { type CanSuspendUserPolicyInput };
