import { Injectable } from "@nestjs/common";

import { Invitation } from "../../../../domain/entities";
import { InvitationRepository } from "../../../../domain/interfaces";

@Injectable()
export class ListInvitationsByTenantUseCase {
    constructor(private readonly invitationRepository: InvitationRepository) {}

    public async execute(tenantId: string): Promise<Invitation[]> {
        const invitations = await this.invitationRepository.listByTenant(tenantId);
        return invitations;
    }
}
