import { ApiProperty } from "@nestjs/swagger";

import { CompanyResponseDto } from "./response";

export class ReactivateCompanyParamsDto {
    @ApiProperty({
        example: "uuid-of-company",
        description: "Identifier of the company.",
    })
    id!: string;
}

export class ReactivateCompanyResponseDto extends CompanyResponseDto {}
