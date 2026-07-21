import { type Vacancy } from "../../domain/entities/vacancy";
import { VacancyRepository } from "../../domain/interfaces/vacancy-repository";

export class VacancyRepositorySpy extends VacancyRepository {
    public create = jest.fn<Promise<void>, [Vacancy]>();
    public list = jest.fn<Promise<Vacancy[]>, []>();
    public get = jest.fn<Promise<Vacancy | null>, [string]>();
    public update = jest.fn<Promise<void>, [Vacancy]>();
}
