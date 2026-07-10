import type { EmploymentType, WorkMode } from "../../../../domain/types";

export interface CreateVacancyInput {
    title: string;
    description: string;
    companyId: string;
    recruiterId: string;
    employmentType: EmploymentType;
    workMode: WorkMode;
    closingDate: Date;
    salary: number | null;
    location: string | null;
}
