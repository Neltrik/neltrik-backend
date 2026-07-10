import { randomUUID } from "crypto";
import { Vacancy } from "src/modules/ats/domain/entities/vacancy";

import type { VacancyRepository } from "../../../domain/interfaces/vacancy-repository";
import { type CreateVacancyInput } from "./input";

export class CreateVacancyUseCase {
    constructor(private readonly vacancyRepository: VacancyRepository) {}

    public async execute(input: CreateVacancyInput): Promise<void> {
        const vacancy = new Vacancy({
            id: randomUUID(),
            title: input.title,
            description: input.description,
            companyId: input.companyId,
            recruiterId: input.recruiterId,
            employmentType: input.employmentType,
            workMode: input.workMode,
            closingDate: input.closingDate,
            salary: input.salary,
            location: input.location,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        });
        await this.vacancyRepository.create(vacancy);
    }
}
