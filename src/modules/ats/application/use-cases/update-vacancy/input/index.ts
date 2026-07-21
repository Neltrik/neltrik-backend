import type { EmploymentType, WorkMode } from "../../../../domain/types";

export interface UpdateVacancyInput {
    id: string;
    title: string;
    description: string;
    employmentType: EmploymentType;
    workMode: WorkMode;
    closingDate: Date;
    salary: number | null;
    location: string | null;
}
