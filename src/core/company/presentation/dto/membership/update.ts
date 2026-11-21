import { ApiProperty } from "@nestjs/swagger";

export class UpdateMemberRoleParamsDto {
    @ApiProperty({
        example: "uuid-of-membership",
        description: "Identifier of the membership to update.",
    })
    id!: string;
}

export class UpdateMemberRoleRequestDto {
    @ApiProperty({
        example: "uuid-of-new-role",
        description: "Identifier of the new role to assign.",
    })
    roleId!: string;
}

export class UpdateMemberRoleResponseDto {
    @ApiProperty({
        example: "uuid-of-membership",
        description: "Unique identifier of the updated membership.",
    })
    id!: string;
}
