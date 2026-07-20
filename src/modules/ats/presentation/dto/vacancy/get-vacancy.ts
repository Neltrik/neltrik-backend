import { ApiProperty } from "@nestjs/swagger";

import {
    EMPLOYMENT_TYPE,
    type EmploymentType,
    VACANCY_STATUS,
    type VacancyStatus,
    WORK_MODE,
    type WorkMode,
} from "../../../domain/types";

export class GetVacancyRequestDto {
    @ApiProperty({
        example: "b8b2a9d5-73f7-47c8-a76b-fd2c91d8d7d1",
    })
    id!: string;
}

export class GetVacancyResultDto {
    @ApiProperty({
        example: "b8b2a9d5-73f7-47c8-a76b-fd2c91d8d7d1",
    })
    id!: string;

    @ApiProperty({
        example: "Backend Developer",
    })
    title!: string;

    @ApiProperty({
        enum: EMPLOYMENT_TYPE,
        example: EMPLOYMENT_TYPE.FULL_TIME,
    })
    employmentType!: EmploymentType;

    @ApiProperty({
        enum: WORK_MODE,
        example: WORK_MODE.REMOTE,
    })
    workMode!: WorkMode;

    @ApiProperty({
        enum: VACANCY_STATUS,
        example: VACANCY_STATUS.PUBLISHED,
    })
    status!: VacancyStatus;

    @ApiProperty({
        example: "Remote",
        nullable: true,
    })
    location!: string | null;

    @ApiProperty({
        example: 5000,
        nullable: true,
    })
    salary!: number | null;

    @ApiProperty({
        example: "2026-12-31T23:59:59.000Z",
        format: "date-time",
    })
    closingDate!: Date;

    @ApiProperty({
        example: "2026-01-01T12:00:00.000Z",
        format: "date-time",
    })
    createdAt!: Date;
}
