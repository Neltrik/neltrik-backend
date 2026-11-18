import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "@/prisma/index";
import { withPaginationArgs } from "@/shared/pagination";
import { TransactionContext } from "@/shared/transaction";

import { Membership } from "../../../domain/entities";
import { MembershipRepository } from "../../../domain/interfaces";
import type { FindByCompanyParams, FindByUserParams } from "../../../domain/types";
import { MembershipMapper } from "../../mappers";

@Injectable()
export class PrismaMembershipRepository extends MembershipRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(membership: Membership, context?: TransactionContext): Promise<Membership> {
        const prisma = context ? context.get<Prisma.TransactionClient>() : this.prisma.tenantClient;
        const persistence = await prisma.membership.create({
            data: MembershipMapper.toPersistence(membership),
        });
        return MembershipMapper.toDomain(persistence);
    }

    public async findById(id: string): Promise<Membership | null> {
        const membership = await this.prisma.tenantClient.membership.findFirst({
            where: { id },
        });
        if (!membership) {
            return null;
        }
        return MembershipMapper.toDomain(membership);
    }

    public async findByUserAndCompany(userId: string, companyId: string): Promise<Membership | null> {
        const membership = await this.prisma.tenantClient.membership.findFirst({
            where: { userId, companyId },
        });
        if (!membership) {
            return null;
        }
        return MembershipMapper.toDomain(membership);
    }

    public async findActiveByUserAndCompany(userId: string, companyId: string): Promise<Membership | null> {
        const membership = await this.prisma.tenantClient.membership.findFirst({
            where: { userId, companyId, status: "ACTIVE" },
        });
        if (!membership) {
            return null;
        }
        return MembershipMapper.toDomain(membership);
    }

    public async findByCompany(params: FindByCompanyParams): Promise<Membership[]> {
        const memberships = await this.prisma.tenantClient.membership.findMany({
            where: { companyId: params.companyId },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            ...withPaginationArgs({ cursor: params.cursor, limit: params.limit }),
        });
        return memberships.map((membership) => MembershipMapper.toDomain(membership));
    }

    public async update(membership: Membership): Promise<void> {
        await this.prisma.tenantClient.membership.update({
            where: { id: membership.id },
            data: MembershipMapper.toPersistence(membership),
        });
    }

    public async findByUser(params: FindByUserParams): Promise<Membership[]> {
        const memberships = await this.prisma.tenantClient.membership.findMany({
            where: { userId: params.userId, ...(params.status && { status: params.status }) },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            ...withPaginationArgs({ cursor: params.cursor, limit: params.limit }),
        });
        return memberships.map((membership) => MembershipMapper.toDomain(membership));
    }
}
