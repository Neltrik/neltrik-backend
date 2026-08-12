import { ApiProperty } from "@nestjs/swagger";

import { TENANT_STATUS, TENANT_TYPE, type TenantStatus, type TenantType } from "../../../domain/types";

export class GetTenantRequestDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}

export class GetTenantResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;

    @ApiProperty({
        example: "Acme Corp",
    })
    name!: string;

    @ApiProperty({
        example: "acme-corp-550e8400",
    })
    slug!: string;

    @ApiProperty({
        enum: TENANT_TYPE,
        example: TENANT_TYPE.CUSTOMER,
    })
    type!: TenantType;

    @ApiProperty({
        enum: TENANT_STATUS,
        example: TENANT_STATUS.ACTIVE,
    })
    status!: TenantStatus;

    @ApiProperty({
        example: "2026-07-01T10:00:00.000Z",
    })
    createdAt!: Date;

    @ApiProperty({
        example: "2026-07-15T15:30:00.000Z",
    })
    updatedAt!: Date;

    @ApiProperty({
        nullable: true,
        example: null,
    })
    suspendedAt!: Date | null;
}
