import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/index";

import { User } from "../../../domain/entities";
import { UserRepository } from "../../../domain/interfaces";
import { Email } from "../../../domain/value-objects";
import { UserMapper } from "../../mappers";

@Injectable()
export class PrismaUserRepository extends UserRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(user: User): Promise<void> {
        await this.prisma.tenantClient.user.create({ data: UserMapper.toPersistence(user) });
    }

    public async update(user: User): Promise<void> {
        await this.prisma.tenantClient.user.update({ where: { id: user.id }, data: UserMapper.toPersistence(user) });
    }

    public async get(id: string): Promise<User | null> {
        const user = await this.prisma.tenantClient.user.findUnique({ where: { id } });
        if (!user) {
            return null;
        }
        return UserMapper.toDomain(user);
    }

    public async list(): Promise<User[]> {
        const users = await this.prisma.tenantClient.user.findMany();
        return users.map((user) => UserMapper.toDomain(user));
    }

    public async existsByEmail(email: Email): Promise<boolean> {
        const user = await this.prisma.tenantClient.user.findUnique({
            where: { email: email.value },
            select: { id: true },
        });
        return user !== null;
    }

    public async delete(id: string): Promise<void> {
        await this.prisma.tenantClient.user.delete({ where: { id } });
    }
}
