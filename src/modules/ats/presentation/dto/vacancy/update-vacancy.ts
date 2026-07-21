import { ApiProperty } from "@nestjs/swagger";

import { EMPLOYMENT_TYPE, type EmploymentType, WORK_MODE, type WorkMode } from "../../../domain/types";

export class UpdateVacancyParamsDto {
    @ApiProperty({
        example: "b8b2a9d5-73f7-47c8-a76b-fd2c91d8d7d1",
    })
    id!: string;
}

export class UpdateVacancyRequestDto {
    @ApiProperty({
        example: "Backend Developer",
    })
    title!: string;

    @ApiProperty({
        example: "Backend Developer with NestJS experience.",
    })
    description!: string;

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
        example: "2026-12-31T23:59:59.000Z",
    })
    closingDate!: string;

    @ApiProperty({
        example: 5000,
        nullable: true,
    })
    salary!: number | null;

    @ApiProperty({
        example: "Bogotá",
        nullable: true,
    })
    location!: string | null;
}

export class UpdateVacancyResultDto {
    @ApiProperty({
        example: "vacancy-id",
    })
    id!: string;
}
