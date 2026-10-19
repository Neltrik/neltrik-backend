import { ApiProperty } from "@nestjs/swagger";

export class UpdateNotificationTemplateRequestDto {
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
}

export class UpdateNotificationTemplateResponseDto {
    @ApiProperty({
        example: "uuid-of-template",
        description: "Identifier of the updated template.",
    })
    id!: string;
}
