import { ApiProperty } from "@nestjs/swagger";

export class InviteMemberRequestDto {
    @ApiProperty({
        example: "uuid-of-user",
        description: "Identifier of the user to invite.",
    })
    userId!: string;

    @ApiProperty({
        example: "uuid-of-role",
        description: "Identifier of the role to assign.",
    })
    roleId!: string;
}

export class InviteMemberResponseDto {
    @ApiProperty({
        example: "uuid-of-membership",
        description: "Unique identifier of the created membership/invitation.",
    })
    id!: string;
}
