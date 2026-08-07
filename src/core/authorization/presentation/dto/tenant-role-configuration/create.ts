import { ApiProperty } from "@nestjs/swagger";

export class CreateTenantRoleConfigurationDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440001",
        description: "Identifier of the tenant.",
    })
    tenantId!: string;

    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440002",
        description: "Identifier of the official role.",
    })
    roleId!: string;

    @ApiProperty({
        example: "Administrator",
        description: "Custom display name for the role within the tenant.",
    })
    displayName!: string;
}

export class CreateTenantRoleConfigurationResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440003",
        description: "Identifier of the created tenant role configuration.",
    })
    id!: string;
}
