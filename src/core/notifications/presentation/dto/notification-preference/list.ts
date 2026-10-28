import { ApiProperty } from "@nestjs/swagger";

import { PaginationQueryDto } from "@/shared/pagination";

import {
    NOTIFICATION_CATEGORIES,
    NOTIFICATION_CATEGORY,
    NOTIFICATION_CHANNEL,
    NOTIFICATION_CHANNELS,
} from "../../../domain/types";

export class ListNotificationPreferencesQueryDto extends PaginationQueryDto {}

export class NotificationPreferenceResponseDto {
    @ApiProperty({
        example: "uuid-of-preference",
        description: "Unique identifier of the preference.",
    })
    id!: string;

    @ApiProperty({
        example: NOTIFICATION_CHANNEL.EMAIL,
        enum: NOTIFICATION_CHANNELS,
        description: "Channel the preference applies to.",
    })
    channel!: string;

    @ApiProperty({
        example: NOTIFICATION_CATEGORY.MARKETING,
        enum: NOTIFICATION_CATEGORIES,
        description: "Notification category the preference applies to.",
    })
    category!: string;

    @ApiProperty({
        example: true,
        description: "Whether the user accepts notifications for this channel and category.",
    })
    enabled!: boolean;

    @ApiProperty({
        example: "2025-01-01T00:00:00.000Z",
        description: "Creation date of the preference.",
    })
    createdAt!: Date;

    @ApiProperty({
        example: "2025-01-01T00:00:00.000Z",
        description: "Last update date of the preference.",
    })
    updatedAt!: Date;
}
