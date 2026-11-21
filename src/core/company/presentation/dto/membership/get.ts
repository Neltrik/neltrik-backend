import { ApiProperty } from "@nestjs/swagger";

class MembershipResponseDto {
    @ApiProperty({
        example: "uuid-of-membership",
        description: "Unique identifier of the membership.",
    })
    id!: string;

    @ApiProperty({
        example: "uuid-of-user",
        description: "Identifier of the user.",
    })
    userId!: string;

    @ApiProperty({
        example: "uuid-of-company",
        description: "Identifier of the company.",
    })
    companyId!: string;

    @ApiProperty({
        example: "uuid-of-role",
        description: "Identifier of the assigned role.",
    })
    roleId!: string;

    @ApiProperty({
        example: "ACTIVE",
        description: "Current status of the membership (ACTIVE, PENDING, SUSPENDED, REVOKED).",
        enum: ["ACTIVE", "PENDING", "SUSPENDED", "REVOKED"],
    })
    status!: string;

    @ApiProperty({
        example: "2023-10-25T10:00:00.000Z",
        description: "Creation timestamp.",
    })
    createdAt!: Date;

    @ApiProperty({
        example: "2023-10-25T10:00:00.000Z",
        description: "Last update timestamp.",
    })
    updatedAt!: Date;
}

export class GetMembershipParamsDto {
    @ApiProperty({
        example: "uuid-of-membership",
        description: "Identifier of the membership.",
    })
    id!: string;
}

export class GetMembershipResponseDto extends MembershipResponseDto {}
