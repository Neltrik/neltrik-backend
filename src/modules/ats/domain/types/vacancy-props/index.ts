import type { EmploymentType } from "../employment-type";
import { type VacancyStatus } from "../vacancy-status";
import type { WorkMode } from "../work-mode";

interface VacancyProps {
    id: string;
    tenantId: string;
    recruiterId: string;
    title: string;
    description: string;
    employmentType: EmploymentType;
    workMode: WorkMode;
    closingDate: Date;
    salary: number | null;
    location: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export type VacancyState = VacancyProps & {
    status: VacancyStatus;
};

export interface UpdateVacancyProps {
    title: string;
    description: string;
    employmentType: EmploymentType;
    workMode: WorkMode;
    closingDate: Date;
    salary: number | null;
    location: string | null;
}
