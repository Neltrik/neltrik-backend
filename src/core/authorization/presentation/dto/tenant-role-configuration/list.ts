import { ApiProperty } from "@nestjs/swagger";

export class TenantRoleConfigurationResultDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    tenantId!: string;

    @ApiProperty()
    roleId!: string;

    @ApiProperty()
    displayName!: string;
}
