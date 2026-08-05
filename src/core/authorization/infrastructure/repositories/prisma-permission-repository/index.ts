import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/index";

import { Permission } from "../../../domain/entities";
import { PermissionRepository } from "../../../domain/interfaces";
import { PermissionMapper } from "../../mappers";

@Injectable()
export class PrismaPermissionRepository extends PermissionRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(permission: Permission): Promise<void> {
        await this.prisma.permission.create({
            data: PermissionMapper.toPersistence(permission),
        });
    }

    public async update(permission: Permission): Promise<void> {
        await this.prisma.permission.update({
            where: { id: permission.id },
            data: PermissionMapper.toPersistence(permission),
        });
    }

    public async get(id: string): Promise<Permission | null> {
        const permission = await this.prisma.permission.findUnique({ where: { id } });
        if (!permission) {
            return null;
        }
        return PermissionMapper.toDomain(permission);
    }

    public async list(): Promise<Permission[]> {
        const permissions = await this.prisma.permission.findMany();
        return permissions.map((permission) => PermissionMapper.toDomain(permission));
    }

    public async existsByCode(code: string): Promise<boolean> {
        const permission = await this.prisma.permission.findUnique({
            where: { code },
            select: { id: true },
        });
        return permission !== null;
    }
}
