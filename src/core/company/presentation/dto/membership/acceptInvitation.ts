import { ApiProperty } from "@nestjs/swagger";

export class AcceptInvitationParamsDto {
    @ApiProperty({
        example: "uuid-of-invitation",
        description: "Identifier of the invitation to accept.",
    })
    id!: string;
}

export class AcceptInvitationResponseDto {
    @ApiProperty({
        example: "uuid-of-membership",
        description: "Unique identifier of the activated membership.",
    })
    id!: string;
}
