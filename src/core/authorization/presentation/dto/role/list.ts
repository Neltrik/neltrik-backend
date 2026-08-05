import { ApiProperty } from "@nestjs/swagger";

export class RoleResultDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    code!: string;

    @ApiProperty()
    defaultDisplayName!: string;

    @ApiProperty()
    description!: string;
}
