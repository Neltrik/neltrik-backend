import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateTenantRoleConfigurationRequestDto {
    @ApiPropertyOptional({
        example: "Administrator",
    })
    displayName!: string;
}

export class UpdateTenantRoleConfigurationResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}

export class UpdateTenantRoleConfigurationParamsDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}
