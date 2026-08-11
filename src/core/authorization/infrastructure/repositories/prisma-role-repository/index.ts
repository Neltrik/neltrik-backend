import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/index";

import { Permission, Role } from "../../../domain/entities";
import { RoleRepository } from "../../../domain/interfaces";
import { PermissionMapper, RoleMapper } from "../../mappers";

@Injectable()
export class PrismaRoleRepository extends RoleRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(role: Role): Promise<void> {
        await this.prisma.role.create({
            data: RoleMapper.toPersistence(role),
        });
    }

    public async update(role: Role): Promise<void> {
        await this.prisma.role.update({
            where: { id: role.id },
            data: RoleMapper.toPersistence(role),
        });
    }

    public async get(id: string): Promise<Role | null> {
        const role = await this.prisma.role.findUnique({ where: { id } });
        if (!role) {
            return null;
        }
        return RoleMapper.toDomain(role);
    }

    public async list(): Promise<Role[]> {
        const roles = await this.prisma.role.findMany();
        return roles.map((role) => RoleMapper.toDomain(role));
    }

    public async existsByCode(code: string): Promise<boolean> {
        const role = await this.prisma.role.findUnique({ where: { code }, select: { id: true } });
        return role !== null;
    }

    public async assignPermissions(roleId: string, permissionIds: string[]): Promise<void> {
        await this.prisma.rolePermission.createMany({
            data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
            skipDuplicates: true,
        });
    }

    public async removePermissions(roleId: string, permissionIds: string[]): Promise<void> {
        await this.prisma.rolePermission.deleteMany({
            where: { roleId, permissionId: { in: permissionIds } },
        });
    }

    public async getPermissionsByRole(roleId: string): Promise<Permission[]> {
        const rolePermissions = await this.prisma.rolePermission.findMany({
            where: { roleId },
            include: { permission: true },
        });
        return rolePermissions.map(({ permission }) => PermissionMapper.toDomain(permission));
    }
}
