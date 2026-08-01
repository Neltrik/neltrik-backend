import { ApiProperty } from "@nestjs/swagger";

export class GetUserParamsDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}

export class GetUserResultDto {
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
        example: "550e8400-e29b-41d4-a716-446655440111",
    })
    tenantId!: string;

    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440222",
    })
    roleId!: string;

    @ApiProperty({
        example: "ACTIVE",
    })
    status!: string;

    @ApiProperty({
        example: "2025-01-01T00:00:00.000Z",
    })
    createdAt!: Date;

    @ApiProperty({
        example: "2025-01-02T10:30:00.000Z",
    })
    updatedAt!: Date;

    @ApiProperty({
        example: null,
        nullable: true,
    })
    suspendedAt!: Date | null;
}
