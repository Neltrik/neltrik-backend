import { ApiProperty } from "@nestjs/swagger";

export class InviteMemberRequestDto {
    @ApiProperty({
        example: "user@example.com",
        description: "Email address of the user to invite.",
    })
    email!: string;

    @ApiProperty({
        example: "uuid-of-role",
        description: "Identifier of the role to assign.",
    })
    roleId!: string;
}

export class InviteMemberResponseDto {
    @ApiProperty({
        example: "uuid-of-invitation",
        description: "Unique identifier of the created invitation/membership.",
    })
    id!: string;
}
