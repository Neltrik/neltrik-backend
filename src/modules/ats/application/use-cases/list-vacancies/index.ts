import { Injectable } from "@nestjs/common";

import type { Vacancy } from "../../../domain/entities";
import { VacancyRepository } from "../../../domain/interfaces";

@Injectable()
export class ListVacanciesUseCase {
    constructor(private readonly vacancyRepository: VacancyRepository) {}

    public execute(): Promise<Vacancy[]> {
        return this.vacancyRepository.list();
    }
}
