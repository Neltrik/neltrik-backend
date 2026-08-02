import { ApiProperty } from "@nestjs/swagger";

import { USER_STATUS, type UserStatus } from "../../../domain/types";

export class GetUsersParamsDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    tenantId!: string;
}

export class GetUsersResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;

    @ApiProperty({
        example: "John",
    })
    firstName!: string;

    @ApiProperty({
        example: "Doe",
    })
    lastName!: string;

    @ApiProperty({
        example: "john@company.com",
    })
    email!: string;

    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440001",
    })
    roleId!: string;

    @ApiProperty({
        enum: USER_STATUS,
        example: USER_STATUS.ACTIVE,
    })
    status!: UserStatus;
}
