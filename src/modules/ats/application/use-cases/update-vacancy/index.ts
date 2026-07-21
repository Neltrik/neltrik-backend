import { Injectable } from "@nestjs/common";

import { VacancyNotFoundError } from "../../../domain/errors";
import { VacancyRepository } from "../../../domain/interfaces/vacancy-repository";
import { type UpdateVacancyInput } from "./input";
import { UpdateVacancyOutput } from "./output";

@Injectable()
export class UpdateVacancyUseCase {
    constructor(private readonly vacancyRepository: VacancyRepository) {}

    public async execute(input: UpdateVacancyInput): Promise<UpdateVacancyOutput> {
        const vacancy = await this.vacancyRepository.get(input.id);
        if (!vacancy) {
            throw new VacancyNotFoundError();
        }
        vacancy.update({
            title: input.title,
            description: input.description,
            employmentType: input.employmentType,
            workMode: input.workMode,
            closingDate: input.closingDate,
            salary: input.salary,
            location: input.location,
        });
        await this.vacancyRepository.update(vacancy);
        return {
            id: vacancy.id,
        };
    }
}

export { UpdateVacancyInput };
