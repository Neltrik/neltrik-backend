import { ApiProperty } from "@nestjs/swagger";

export class UpdateTenantParamsDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}

export class UpdateTenantRequestDto {
    @ApiProperty({
        example: "Acme Corporation",
    })
    name!: string;
}

export class UpdateTenantResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}
