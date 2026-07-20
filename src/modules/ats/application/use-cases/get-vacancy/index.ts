import { Injectable } from "@nestjs/common";

import type { Vacancy } from "../../../domain/entities/vacancy";
import { VacancyNotFoundError } from "../../../domain/errors";
import { VacancyRepository } from "../../../domain/interfaces/vacancy-repository";

@Injectable()
export class GetVacancyUseCase {
    constructor(private readonly vacancyRepository: VacancyRepository) {}

    public async execute(id: string): Promise<Vacancy> {
        const vacancy = await this.vacancyRepository.get(id);
        if (!vacancy) {
            throw new VacancyNotFoundError();
        }
        return vacancy;
    }
}
