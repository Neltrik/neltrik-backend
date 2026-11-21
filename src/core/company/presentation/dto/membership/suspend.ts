import { ApiProperty } from "@nestjs/swagger";

export class SuspendMemberParamsDto {
    @ApiProperty({
        example: "uuid-of-membership",
        description: "Identifier of the membership to suspend.",
    })
    id!: string;
}

export class SuspendMemberResponseDto {
    @ApiProperty({
        example: "uuid-of-membership",
        description: "Unique identifier of the suspended membership.",
    })
    id!: string;
}
