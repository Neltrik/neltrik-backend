import { ApiProperty } from "@nestjs/swagger";

import { NOTIFICATION_CHANNELS, type NotificationChannel } from "../../../domain/types";

export class CreateNotificationTemplateRequestDto {
    @ApiProperty({
        example: "RESET_PASSWORD",
        description: "Logical code that identifies the template type.",
    })
    code!: string;

    @ApiProperty({
        example: "EMAIL",
        enum: NOTIFICATION_CHANNELS,
        description: "Channel the template applies to.",
    })
    channel!: NotificationChannel;

    @ApiProperty({
        example: "es-CO",
        description: "Locale of the template.",
    })
    locale!: string;

    @ApiProperty({
        example: "Reset your password",
        description: "Subject of the template. Required when channel is EMAIL.",
        nullable: true,
    })
    subject!: string | null;

    @ApiProperty({
        example: "Hello {{name}}, click here to reset your password.",
        description: "Body of the template.",
    })
    body!: string;

    @ApiProperty({
        example: null,
        description: "Target tenant ID. Null means a global template (PlatformAdmin only).",
        nullable: true,
    })
    targetTenantId!: string | null;
}

export class CreateNotificationTemplateResponseDto {
    @ApiProperty({
        example: "uuid-of-template",
        description: "Identifier of the created template.",
    })
    id!: string;
}
