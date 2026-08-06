import { ApiProperty } from "@nestjs/swagger";

export class CreatePermissionDto {
    @ApiProperty({
        example: "USER_CREATE",
    })
    code!: string;

    @ApiProperty({
        example: "Allows creating users.",
    })
    description!: string;
}

export class CreatePermissionResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}
