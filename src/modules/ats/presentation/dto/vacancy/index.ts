import { ApiProperty } from "@nestjs/swagger";

import type { EmploymentType, WorkMode } from "../../../domain/types";

export class CreateVacancyRequestDto {
    @ApiProperty({
        example: "Backend Developer",
    })
    title!: string;

    @ApiProperty({
        example: "Develop REST APIs using NestJS.",
    })
    description!: string;

    @ApiProperty({
        example: "tenant-123",
    })
    tenantId!: string;

    @ApiProperty({
        example: "recruiter-123",
    })
    recruiterId!: string;

    @ApiProperty({
        example: "FULL_TIME",
    })
    employmentType!: EmploymentType;

    @ApiProperty({
        example: "REMOTE",
    })
    workMode!: WorkMode;

    @ApiProperty({
        example: "2026-08-01T00:00:00.000Z",
    })
    closingDate!: Date;

    @ApiProperty({
        required: false,
        nullable: true,
        example: 4500000,
    })
    salary!: number | null;

    @ApiProperty({
        required: false,
        nullable: true,
        example: "Bogotá",
    })
    location!: string | null;
}

export class CreateVacancyResultDto {
    @ApiProperty({
        example: "b8b2a9d5-73f7-47c8-a76b-fd2c91d8d7d1",
    })
    id!: string;
}
