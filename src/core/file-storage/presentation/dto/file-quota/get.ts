import { ApiProperty } from "@nestjs/swagger";

export class GetFileQuotaResponseDto {
    @ApiProperty({
        example: 1073741824,
        description: "Maximum storage allowed for the tenant, in bytes.",
    })
    limitBytes!: number;

    @ApiProperty({
        example: 524288000,
        description: "Storage currently consumed by the tenant, in bytes.",
    })
    usedBytes!: number;

    @ApiProperty({
        example: 549453824,
        description: "Storage still available for the tenant, in bytes.",
    })
    availableBytes!: number;

    @ApiProperty({
        example: false,
        description: "Whether the tenant is close to its storage limit.",
    })
    isNearLimit!: boolean;

    @ApiProperty({
        example: false,
        description: "Whether the tenant has exceeded its storage limit.",
    })
    isOverLimit!: boolean;
}
