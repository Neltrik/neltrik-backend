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

    public async get(id: string): Promise<Vacancy | null> {
        const vacancy = await this.prisma.vacancy.findUnique({ where: { id } });
        if (!vacancy) {
            return null;
        }
        return VacancyMapper.toDomain(vacancy);
    }

    public async update(vacancy: Vacancy): Promise<void> {
        const persistence = VacancyMapper.toPersistence(vacancy);
        await this.prisma.vacancy.update({
            where: {
                id: vacancy.id,
            },
            data: {
                title: persistence.title,
                description: persistence.description,
                employmentType: persistence.employmentType,
                workMode: persistence.workMode,
                closingDate: persistence.closingDate,
                status: persistence.status,
                salary: persistence.salary,
                location: persistence.location,
                updatedAt: persistence.updatedAt,
            },
        });
    }
}
