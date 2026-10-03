import { ApiProperty } from "@nestjs/swagger";

export class AdjustQuotaLimitRequestDto {
    @ApiProperty({
        example: 5368709120,
        description: "New storage limit for the tenant, in bytes.",
    })
    newLimitBytes!: number;
}

export class AdjustQuotaLimitParamsDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "Identifier of the tenant whose quota will be adjusted.",
    })
    tenantId!: string;
}
