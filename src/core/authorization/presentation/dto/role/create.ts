import { ApiProperty } from "@nestjs/swagger";

export class CreateRoleRequestDto {
    @ApiProperty({
        example: "TENANT_ADMIN",
    })
    code!: string;

    @ApiProperty({
        example: "Tenant Administrator",
    })
    defaultDisplayName!: string;

    @ApiProperty({
        example: "Tenant administrator role.",
    })
    description!: string;
}

export class CreateRoleResultDto {
    @ApiProperty()
    id!: string;
}
