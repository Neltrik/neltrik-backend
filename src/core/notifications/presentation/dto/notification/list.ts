import { ApiProperty } from "@nestjs/swagger";

import { PaginationQueryDto } from "@/shared/pagination";

import {
    NOTIFICATION_CHANNEL,
    NOTIFICATION_CHANNELS,
    NOTIFICATION_STATUS,
    NOTIFICATION_STATUSES,
} from "../../../domain/types";

export class ListNotificationsQueryDto extends PaginationQueryDto {}

export class ListNotificationResponseDto {
    @ApiProperty({
        example: "uuid-of-notification",
        description: "Unique identifier of the notification.",
    })
    id!: string;

    @ApiProperty({
        example: "RESET_PASSWORD",
        description: "Code of the template used to render the notification.",
    })
    code!: string;

    @ApiProperty({
        example: NOTIFICATION_CHANNEL.EMAIL,
        enum: NOTIFICATION_CHANNELS,
        isArray: true,
        description: "Channels through which the notification was delivered.",
    })
    channels!: string[];

    @ApiProperty({
        example: "es-CO",
        description: "Locale of the notification.",
    })
    locale!: string;

    @ApiProperty({
        example: { name: "Juan", url: "https://..." },
        description: "Payload used to render the notification.",
    })
    payload!: Record<string, unknown>;

    @ApiProperty({
        example: NOTIFICATION_STATUS.PENDING,
        enum: NOTIFICATION_STATUSES,
        description: "Current status of the notification.",
    })
    status!: string;

    @ApiProperty({
        example: 1,
        description: "Number of delivery attempts.",
    })
    attempts!: number;

    @ApiProperty({
        example: "2025-01-01T00:00:00.000Z",
        nullable: true,
        description: "Date when the notification was sent.",
    })
    sentAt!: Date | null;

    @ApiProperty({
        example: "2025-01-01T00:00:00.000Z",
        nullable: true,
        description: "Date when the notification was marked as read.",
    })
    readAt!: Date | null;

    @ApiProperty({
        example: "2025-01-01T00:00:00.000Z",
        description: "Creation date of the notification.",
    })
    createdAt!: Date;

    @ApiProperty({
        example: "2025-01-01T00:00:00.000Z",
        description: "Last update date of the notification.",
    })
    updatedAt!: Date;
}
