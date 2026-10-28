import { ApiProperty } from "@nestjs/swagger";

export class UpdateNotificationPreferenceRequestDto {
    @ApiProperty({
        example: false,
        description: "Whether the user accepts notifications for this channel and category.",
    })
    enabled!: boolean;
}
