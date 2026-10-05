import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "@/prisma/index";
import { withPaginationArgs } from "@/shared/pagination";
import { TransactionContext } from "@/shared/transaction";

import { File } from "../../../domain/entities";
import { FileRepository } from "../../../domain/interfaces";
import { FILE_STATUS, type FilePurpose, type FindManyFilesParams } from "../../../domain/types";
import { FileMapper } from "../../mappers";

@Injectable()
export class PrismaFileRepository extends FileRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(file: File): Promise<void> {
        await this.prisma.tenantClient.file.create({
            data: FileMapper.toPersistence(file),
        });
    }

    public async findById(id: string): Promise<File | null> {
        const file = await this.prisma.tenantClient.file.findUnique({ where: { id } });
        if (!file) {
            return null;
        }
        return FileMapper.toDomain(file);
    }

    public async findByResource(tenantId: string, resourceType: string, resourceId: string): Promise<File[]> {
        const files = await this.prisma.tenantClient.file.findMany({
            where: { tenantId, resourceType, resourceId },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        });
        return files.map((file) => FileMapper.toDomain(file));
    }

    public async findByResourceAndPurpose(
        tenantId: string,
        resourceType: string,
        resourceId: string,
        purpose: FilePurpose,
    ): Promise<File | null> {
        const file = await this.prisma.tenantClient.file.findFirst({
            where: {
                tenantId,
                resourceType,
                resourceId,
                purpose,
                status: { in: [FILE_STATUS.PENDING, FILE_STATUS.READY, FILE_STATUS.INFECTED] },
            },
        });
        if (!file) {
            return null;
        }
        return FileMapper.toDomain(file);
    }

    public async findMany(params: FindManyFilesParams): Promise<File[]> {
        const files = await this.prisma.tenantClient.file.findMany({
            where: {
                tenantId: params.tenantId,
                ...(params.ownerId && { ownerId: params.ownerId }),
                ...(params.resourceType && { resourceType: params.resourceType }),
                ...(params.resourceId && { resourceId: params.resourceId }),
                ...(params.purpose && { purpose: params.purpose }),
                ...(params.status && { status: params.status }),
            },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            ...withPaginationArgs({ cursor: params.cursor, limit: params.limit }),
        });
        return files.map((file) => FileMapper.toDomain(file));
    }

    public async update(file: File, context?: TransactionContext): Promise<void> {
        const prisma = context ? context.get<Prisma.TransactionClient>() : this.prisma.tenantClient;
        await prisma.file.update({
            where: { id: file.id },
            data: FileMapper.toPersistence(file),
        });
    }
}
