import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/index";

import { Vacancy } from "../../../domain/entities/vacancy";
import { VacancyRepository } from "../../../domain/interfaces/vacancy-repository";
import { VacancyMapper } from "../../mappers";

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

    public async list(): Promise<Vacancy[]> {
        const vacancies = await this.prisma.vacancy.findMany();
        return vacancies.map((vacancy) => VacancyMapper.toDomain(vacancy));
    }
}
