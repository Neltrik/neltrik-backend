import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateRoleRequestDto {
    @ApiPropertyOptional({
        example: "Tenant Administrator",
    })
    defaultDisplayName?: string;

    @ApiPropertyOptional({
        example: "Updated description.",
    })
    description?: string;
}

export class UpdateRoleResultDto {
    @ApiProperty()
    id!: string;
}

export class RoleParamsDto {
    @ApiProperty()
    id!: string;
}
