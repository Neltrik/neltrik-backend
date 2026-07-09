import { Injectable } from "@nestjs/common";

import { Vacancy } from "../../../domain/entities/vacancy";
import { VacancyRepository } from "../../../domain/interfaces/vacancy-repository";
import { VacancyMapper } from "../../mappers/vacancy";

import { PrismaService } from "@/prisma/index";

@Injectable()
export class PrismaVacancyRepository extends VacancyRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(vacancy: Vacancy): Promise<void> {
        await this.prisma.vacancy.create({
            data: VacancyMapper.toPersistence(vacancy),
        });
    }
}
