import { ApiProperty } from "@nestjs/swagger";

import { PaginationQueryDto } from "@/shared/pagination";

import { NOTIFICATION_CHANNELS } from "../../../domain/types";

export class ListNotificationTemplatesQueryDto extends PaginationQueryDto {}

export class NotificationTemplateResponseDto {
    @ApiProperty({
        example: "uuid-of-template",
        description: "Unique identifier of the template.",
    })
    id!: string;

    @ApiProperty({
        example: "uuid-of-tenant",
        description: "Tenant the template belongs to. Null for global templates.",
        nullable: true,
    })
    tenantId!: string | null;

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
    channel!: string;

    @ApiProperty({
        example: "es-CO",
        description: "Locale of the template.",
    })
    locale!: string;

    @ApiProperty({
        example: "Reset your password",
        description: "Subject of the template. Null for IN_APP channel.",
        nullable: true,
    })
    subject!: string | null;

    @ApiProperty({
        example: "Hello {{name}}, click here to reset your password.",
        description: "Body of the template.",
    })
    body!: string;

    @ApiProperty({
        example: true,
        description: "Whether the template is active.",
    })
    isActive!: boolean;

    @ApiProperty({
        example: "2025-01-01T00:00:00.000Z",
        description: "Creation date of the template.",
    })
    createdAt!: Date;

    @ApiProperty({
        example: "2025-01-01T00:00:00.000Z",
        description: "Last update date of the template.",
    })
    updatedAt!: Date;
}
