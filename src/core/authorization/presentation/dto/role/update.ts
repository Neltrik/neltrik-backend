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
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}

export class UpdateRoleParamsDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}
