import { ApiProperty } from "@nestjs/swagger";

export class DeactivateNotificationTemplateResponseDto {
    @ApiProperty({
        example: "uuid-of-template",
        description: "Identifier of the deactivated template.",
    })
    id!: string;
}
