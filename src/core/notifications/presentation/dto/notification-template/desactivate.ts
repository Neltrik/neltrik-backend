import { ApiProperty } from "@nestjs/swagger";

export class DesactivateNotificationTemplateResponseDto {
    @ApiProperty({
        example: "uuid-of-template",
        description: "Identifier of the desactivated template.",
    })
    id!: string;
}
