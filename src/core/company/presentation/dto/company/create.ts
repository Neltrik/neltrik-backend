import { ApiProperty } from "@nestjs/swagger";

export class CreateCompanyRequestDto {
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
}

export class CreateCompanyResponseDto {
    @ApiProperty({
        example: "uuid-of-company",
        description: "Unique identifier of the created company.",
    })
    id!: string;
}
