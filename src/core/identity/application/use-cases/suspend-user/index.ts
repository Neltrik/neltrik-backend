import { Injectable } from "@nestjs/common";

import { AUDIT_ACTION, AUDIT_RESOURCE, AUDIT_STATUS, AuditApi } from "@/core/audit/api";
import { AuthorizationPolicyApi } from "@/core/authorization/api";

import { UserNotFoundError } from "../../../domain/errors";
import { UserRepository } from "../../../domain/interfaces";
import { SuspendUserInput } from "./input";

@Injectable()
export class SuspendUserUseCase {
    constructor(
        private readonly auditApi: AuditApi,
        private readonly userRepository: UserRepository,
        private readonly authorizationPolicyApi: AuthorizationPolicyApi,
    ) {}

    public async execute(input: SuspendUserInput): Promise<void> {
        const actor = await this.userRepository.get(input.actorUserId);
        if (!actor) {
            this.auditApi.record({
                action: AUDIT_ACTION.USER_SUSPENDED,
                resource: AUDIT_RESOURCE.USER,
                resourceId: input.targetUserId,
                userId: input.actorUserId,
                userEmail: null,
                tenantId: null,
                status: AUDIT_STATUS.FAILED,
                metadata: { targetUserId: input.targetUserId, reason: "actor_not_found" },
            });
            throw new UserNotFoundError();
        }
        const target = await this.userRepository.get(input.targetUserId);
        if (!target) {
            this.auditApi.record({
                action: AUDIT_ACTION.USER_SUSPENDED,
                resource: AUDIT_RESOURCE.USER,
                resourceId: input.targetUserId,
                userId: input.actorUserId,
                userEmail: actor.email.value,
                tenantId: actor.tenantId,
                status: AUDIT_STATUS.FAILED,
                metadata: { targetUserId: input.targetUserId, reason: "target_not_found" },
            });
            throw new UserNotFoundError();
        }
        await this.auditApi.recordWithFn(
            {
                action: AUDIT_ACTION.USER_SUSPENDED,
                resource: AUDIT_RESOURCE.USER,
                resourceId: input.targetUserId,
                userId: input.actorUserId,
                userEmail: actor.email.value,
                tenantId: actor.tenantId,
                metadata: {
                    actorRoleId: actor.roleId,
                    targetUserId: input.targetUserId,
                    targetRoleId: target.roleId,
                },
            },
            async () => {
                await this.authorizationPolicyApi.canSuspend({
                    actorRoleId: actor.roleId,
                    targetRoleId: target.roleId,
                });
                target.suspend();
                await this.userRepository.update(target);
            },
        );
    }
}
