import { ApiProperty } from "@nestjs/swagger";

export class ReactivateMemberParamsDto {
    @ApiProperty({
        example: "uuid-of-membership",
        description: "Identifier of the membership to reactivate.",
    })
    id!: string;
}

export class ReactivateMemberResponseDto {
    @ApiProperty({
        example: "uuid-of-membership",
        description: "Unique identifier of the reactivated membership.",
    })
    id!: string;
}
