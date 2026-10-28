import { ApiProperty } from "@nestjs/swagger";

import {
    NOTIFICATION_CATEGORIES,
    NOTIFICATION_CATEGORY,
    NOTIFICATION_CHANNEL,
    NOTIFICATION_CHANNELS,
    type NotificationCategory,
    type NotificationChannel,
} from "../../../domain/types";

export class CreateNotificationPreferenceRequestDto {
    @ApiProperty({
        example: NOTIFICATION_CHANNEL.EMAIL,
        enum: NOTIFICATION_CHANNELS,
        description: "Channel the preference applies to.",
    })
    channel!: NotificationChannel;

    @ApiProperty({
        example: NOTIFICATION_CATEGORY.MARKETING,
        enum: NOTIFICATION_CATEGORIES,
        description: "Notification category the preference applies to.",
    })
    category!: NotificationCategory;
}
