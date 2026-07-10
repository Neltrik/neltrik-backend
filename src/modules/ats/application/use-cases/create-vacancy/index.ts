import { type IdGenerator } from "@/shared/id-generator";

import { Vacancy } from "../../../domain/entities/vacancy";
import type { VacancyRepository } from "../../../domain/interfaces/vacancy-repository";
import { type CreateVacancyInput } from "./input";
import { type CreateVacancyOutput } from "./output";

export class CreateVacancyUseCase {
    constructor(
        private readonly vacancyRepository: VacancyRepository,
        private readonly idGenerator: IdGenerator,
    ) {}

    public async execute(input: CreateVacancyInput): Promise<CreateVacancyOutput> {
        const vacancy = new Vacancy({
            id: this.idGenerator.generate(),
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
        return { id: vacancy.id };
    }
}

export { CreateVacancyInput };
