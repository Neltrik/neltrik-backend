import { ApiProperty } from "@nestjs/swagger";

export class RegisterUserRequestDto {
    @ApiProperty({
        example: "John",
    })
    firstName!: string;

    @ApiProperty({
        example: "Doe",
    })
    lastName!: string;

    @ApiProperty({
        example: "john.doe@company.com",
    })
    email!: string;

    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440002",
    })
    roleId!: string;
}

export class RegisterUserResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}
