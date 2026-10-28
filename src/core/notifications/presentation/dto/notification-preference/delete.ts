import { ApiProperty } from "@nestjs/swagger";

export class DeleteNotificationPreferenceResponseDto {
    @ApiProperty({
        example: "uuid-of-preference",
        description: "Identifier of the deleted preference.",
    })
    id!: string;
}
