import { ApiProperty } from "@nestjs/swagger";

export class RequestPasswordResetRequestDto {
    @ApiProperty({
        example: "juan.perez@empresa.com",
        description: "Email del usuario que solicita restablecer su contraseña",
    })
    email!: string;
}

export class ResetPasswordRequestDto {
    @ApiProperty({
        example: "a1b2c3d4e5f67890abcdef1234567890",
        description: "Token de restablecimiento recibido por email",
    })
    token!: string;

    @ApiProperty({
        example: "MiNuevaPasswordSegura123",
        description: "Nueva contraseña del usuario",
        minLength: 8,
    })
    newPassword!: string;
}
