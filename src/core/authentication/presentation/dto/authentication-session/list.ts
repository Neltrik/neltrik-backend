import { ApiProperty } from "@nestjs/swagger";

export class SessionDetailsResponseDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "ID de la sesión",
    })
    id!: string;

    @ApiProperty({
        example: "192.168.1.1",
        description: "Dirección IP desde donde se inició la sesión",
        nullable: true,
    })
    ipAddress!: string | null;

    @ApiProperty({
        example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        description: "User-Agent del dispositivo",
        nullable: true,
    })
    userAgent!: string | null;

    @ApiProperty({
        example: "2026-09-07T15:30:00.000Z",
        description: "Última fecha de uso de la sesión",
        nullable: true,
    })
    lastUsedAt!: Date | null;

    @ApiProperty({
        example: "2026-09-07T10:00:00.000Z",
        description: "Fecha de creación de la sesión",
    })
    createdAt!: Date;

    @ApiProperty({
        example: "2026-09-07T10:15:00.000Z",
        description: "Fecha de expiración de la sesión",
    })
    expiresAt!: Date;

    @ApiProperty({
        example: false,
        description: "Indica si la sesión está revocada",
    })
    isRevoked!: boolean;

    @ApiProperty({
        example: true,
        description: "Indica si es la sesión actual",
    })
    isCurrent!: boolean;
}

export class ListSessionsResponseDto {
    @ApiProperty({
        type: [SessionDetailsResponseDto],
        description: "Lista de sesiones del usuario",
    })
    sessions!: SessionDetailsResponseDto[];
}
