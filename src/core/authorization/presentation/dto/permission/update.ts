import { ApiProperty } from "@nestjs/swagger";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdatePermissionDto {
    @ApiPropertyOptional({
        example: "Allows creating users.",
    })
    description?: string;
}

export class UpdatePermissionResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}

export class UpdatePermissionParamsDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}
