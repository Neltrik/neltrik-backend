import { ApiProperty } from "@nestjs/swagger";

export class LoginRequestDto {
    @ApiProperty({
        example: "juan.perez@empresa.com",
        description: "Email del usuario",
    })
    email!: string;

    @ApiProperty({
        example: "MiPasswordSeguro123",
        description: "Contraseña del usuario",
    })
    password!: string;

    @ApiProperty({
        example: "192.168.1.1",
        description: "Dirección IP del cliente (opcional)",
        required: false,
    })
    ipAddress?: string;

    @ApiProperty({
        example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        description: "User-Agent del cliente (opcional)",
        required: false,
    })
    userAgent?: string;
}

export class LoginResponseDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "ID de la sesión creada",
    })
    sessionId!: string;
}
