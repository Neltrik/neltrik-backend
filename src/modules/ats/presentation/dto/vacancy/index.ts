import type { EmploymentType, WorkMode } from "../../../domain/types";

export class CreateVacancyRequestDto {
    title!: string;
    description!: string;
    companyId!: string;
    recruiterId!: string;
    employmentType!: EmploymentType;
    workMode!: WorkMode;
    closingDate!: Date;
    salary!: number | null;
    location!: string | null;
}

export class CreateVacancyResponseDto {
    data!: {
        id: string;
    };
    message!: string;
}
