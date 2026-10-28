import { ApiProperty } from "@nestjs/swagger";

export class NotificationPreferenceParamsDto {
    @ApiProperty({
        example: "uuid-of-preference",
        description: "Unique identifier of the notification preference.",
    })
    id!: string;
}
