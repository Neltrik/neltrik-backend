import { Injectable } from "@nestjs/common";

import type { Vacancy } from "../../../domain/entities/vacancy";
import { VacancyRepository } from "../../../domain/interfaces/vacancy-repository";

@Injectable()
export class ListVacanciesUseCase {
    constructor(private readonly vacancyRepository: VacancyRepository) {}

    public async execute(): Promise<Vacancy[]> {
        return this.vacancyRepository.list();
    }
}
