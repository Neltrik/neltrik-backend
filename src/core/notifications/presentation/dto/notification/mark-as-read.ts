import { ApiProperty } from "@nestjs/swagger";

export class MarkNotificationAsReadParamsDto {
    @ApiProperty({
        example: "uuid-of-notification",
        description: "Identifier of the notification to mark as read.",
    })
    id!: string;
}

export class MarkNotificationAsReadResponseDto {
    @ApiProperty({
        example: "uuid-of-notification",
        description: "Identifier of the notification marked as read.",
    })
    id!: string;
}
