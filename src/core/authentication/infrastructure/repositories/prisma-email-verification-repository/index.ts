import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/index";

import { EmailVerification } from "../../../domain/entities";
import { EmailVerificationRepository } from "../../../domain/interfaces";
import { EmailVerificationMapper } from "../../mappers";

@Injectable()
export class PrismaEmailVerificationRepository extends EmailVerificationRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(verification: EmailVerification): Promise<void> {
        await this.prisma.emailVerification.create({
            data: EmailVerificationMapper.toPersistence(verification),
        });
    }

    public async update(verification: EmailVerification): Promise<void> {
        await this.prisma.emailVerification.update({
            where: { id: verification.id },
            data: EmailVerificationMapper.toPersistence(verification),
        });
    }

    public async findById(id: string): Promise<EmailVerification | null> {
        const verification = await this.prisma.emailVerification.findUnique({
            where: { id },
        });
        if (!verification) {
            return null;
        }
        return EmailVerificationMapper.toDomain(verification);
    }

    public async findByTokenHash(tokenHash: string): Promise<EmailVerification | null> {
        const verification = await this.prisma.emailVerification.findFirst({
            where: { tokenHash },
        });
        if (!verification) {
            return null;
        }
        return EmailVerificationMapper.toDomain(verification);
    }

    public async findPendingByAccount(authenticationAccountId: string): Promise<EmailVerification[]> {
        const verifications = await this.prisma.emailVerification.findMany({
            where: { authenticationAccountId, verifiedAt: null, expiresAt: { gt: new Date() } },
        });
        return verifications.map((verification) => EmailVerificationMapper.toDomain(verification));
    }

    public async invalidatePendingByAccount(authenticationAccountId: string): Promise<void> {
        await this.prisma.emailVerification.updateMany({
            where: { authenticationAccountId, verifiedAt: null },
            data: { expiresAt: new Date(), updatedAt: new Date() },
        });
    }
}
