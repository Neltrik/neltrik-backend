import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/index";

import { Invitation } from "../../../domain/entities";
import { InvitationRepository } from "../../../domain/interfaces";
import { InvitationMapper } from "../../mappers";

@Injectable()
export class PrismaInvitationRepository extends InvitationRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(invitation: Invitation): Promise<void> {
        await this.prisma.tenantClient.invitation.create({
            data: InvitationMapper.toPersistence(invitation),
        });
    }

    public async update(invitation: Invitation): Promise<void> {
        await this.prisma.tenantClient.invitation.update({
            where: { id: invitation.id },
            data: InvitationMapper.toPersistence(invitation),
        });
    }

    public async getByToken(token: string): Promise<Invitation | null> {
        const invitation = await this.prisma.tenantClient.invitation.findUnique({
            where: { token },
        });
        if (!invitation) {
            return null;
        }
        return InvitationMapper.toDomain(invitation);
    }

    public async listByTenant(tenantId: string): Promise<Invitation[]> {
        const invitations = await this.prisma.tenantClient.invitation.findMany({
            where: { tenantId },
        });
        return invitations.map((invitation) => InvitationMapper.toDomain(invitation));
    }

    public async findPendingByTenantAndRecipient(tenantId: string, recipient: string): Promise<Invitation | null> {
        const invitation = await this.prisma.tenantClient.invitation.findFirst({
            where: { tenantId, recipient, status: "PENDING" },
        });
        if (!invitation) {
            return null;
        }
        return InvitationMapper.toDomain(invitation);
    }
}
