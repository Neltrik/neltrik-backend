import { ApiProperty } from "@nestjs/swagger";

import { CompanyResponseDto } from "./response";

export class SuspendCompanyParamsDto {
    @ApiProperty({
        example: "uuid-of-company",
        description: "Identifier of the company.",
    })
    id!: string;
}

export class SuspendCompanyResponseDto extends CompanyResponseDto {}
