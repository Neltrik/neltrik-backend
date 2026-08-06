import { ApiProperty } from "@nestjs/swagger";

export class PermissionResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;

    @ApiProperty({
        example: "USER_CREATE",
    })
    code!: string;

    @ApiProperty({
        example: "Allows creating users.",
    })
    description!: string;
}
