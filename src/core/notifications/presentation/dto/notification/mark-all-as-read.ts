import { ApiProperty } from "@nestjs/swagger";

export class MarkAllNotificationsAsReadResponseDto {
    @ApiProperty({
        example: 5,
        description: "Number of notifications marked as read.",
    })
    updatedCount!: number;
}
