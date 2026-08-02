import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserParamsDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}

export class UpdateUserRequestDto {
    @ApiProperty({
        example: "John",
    })
    firstName?: string;

    @ApiProperty({
        example: "Doe",
    })
    lastName?: string;

    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440111",
    })
    roleId?: string;
}

export class UpdateUserResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}
