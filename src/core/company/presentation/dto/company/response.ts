import { ApiProperty } from "@nestjs/swagger";

import { COMPANY_STATUS, COMPANY_STATUSES } from "../../../domain/types";

export class CompanyResponseDto {
    @ApiProperty({
        example: "uuid-of-company",
        description: "Unique identifier of the company.",
    })
    id!: string;

    @ApiProperty({
        example: "uuid-of-tenant",
        description: "Identifier of the tenant the company belongs to.",
    })
    tenantId!: string;

    @ApiProperty({
        example: "Acme Corp",
        description: "Name of the company.",
    })
    name!: string;

    @ApiProperty({
        example: "acme-corp",
        description: "Slug of the company (unique within the tenant).",
    })
    slug!: string;

    @ApiProperty({
        example: COMPANY_STATUS.ACTIVE,
        enum: COMPANY_STATUSES,
        description: "Current status of the company.",
    })
    status!: string;

    @ApiProperty({
        example: "2025-01-01T00:00:00.000Z",
        description: "Creation date of the company.",
    })
    createdAt!: Date;

    @ApiProperty({
        example: "2025-01-01T00:00:00.000Z",
        description: "Last update date of the company.",
    })
    updatedAt!: Date;
}
