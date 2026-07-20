import type { Vacancy } from "../../entities/vacancy";

export abstract class VacancyRepository {
    public abstract create(vacancy: Vacancy): Promise<void>;
    public abstract list(): Promise<Vacancy[]>;
    public abstract get(id: string): Promise<Vacancy | null>;
}
