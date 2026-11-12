import { ApiProperty } from "@nestjs/swagger";

export class GetCompanyParamsDto {
    @ApiProperty({
        example: "uuid-of-company",
        description: "Identifier of the company.",
    })
    id!: string;
}
