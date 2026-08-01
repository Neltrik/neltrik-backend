import { Injectable } from "@nestjs/common";

import { Email } from "@/core/identity/domain/value-objects";
import { PrismaService } from "@/prisma/index";

import { User } from "../../../domain/entities";
import { UserRepository } from "../../../domain/interfaces";
import { UserMapper } from "../../mappers";

@Injectable()
export class PrismaUserRepository extends UserRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(user: User): Promise<void> {
        await this.prisma.user.create({ data: UserMapper.toPersistence(user) });
    }

    public async existsByEmail(email: Email): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { email: email.value },
            select: { id: true },
        });
        return user !== null;
    }
}
