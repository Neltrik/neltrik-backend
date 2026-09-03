import { ApiProperty } from "@nestjs/swagger";

export class ValidateEmailVerificationQueryDto {
    @ApiProperty({
        example: "a1b2c3d4e5f67890abcdef1234567890",
        description: "Token de verificación recibido por email",
        required: true,
    })
    token!: string;
}
