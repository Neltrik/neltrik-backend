import { ApiProperty } from "@nestjs/swagger";

import { CompanyResponseDto } from "./response";

export class UpdateCompanyRequestDto {
    @ApiProperty({
        example: "Acme Corp",
        description: "Name of the company.",
        required: false,
    })
    name?: string;

    @ApiProperty({
        example: "acme-corp",
        description: "Slug of the company (unique within the tenant).",
        required: false,
    })
    slug?: string;
}

export class UpdateCompanyResponseDto extends CompanyResponseDto {}
