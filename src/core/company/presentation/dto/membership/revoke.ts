import { ApiProperty } from "@nestjs/swagger";

export class RevokeMemberParamsDto {
    @ApiProperty({
        example: "uuid-of-membership",
        description: "Identifier of the membership to revoke.",
    })
    id!: string;
}

export class RevokeMemberResponseDto {
    @ApiProperty({
        example: "uuid-of-membership",
        description: "Unique identifier of the revoked membership.",
    })
    id!: string;
}
