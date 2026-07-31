import { Injectable } from "@nestjs/common";

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
}
