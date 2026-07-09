import type { Vacancy } from "../../entities/vacancy";

export abstract class VacancyRepository {
    public abstract create(vacancy: Vacancy): Promise<void>;
}
