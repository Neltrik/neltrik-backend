import { ApiProperty } from "@nestjs/swagger";

import { TENANT_TYPE, type TenantType } from "../../../domain/types";

export class CreateTenantRequestDto {
    @ApiProperty({
        example: "Acme Corporation",
    })
    name!: string;

    @ApiProperty({
        enum: TENANT_TYPE,
        example: TENANT_TYPE.CUSTOMER,
    })
    type!: TenantType;
}

export class CreateTenantResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}
