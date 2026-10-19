import { ApiProperty } from "@nestjs/swagger";

export class ActivateNotificationTemplateResponseDto {
    @ApiProperty({
        example: "uuid-of-template",
        description: "Identifier of the activated template.",
    })
    id!: string;
}
