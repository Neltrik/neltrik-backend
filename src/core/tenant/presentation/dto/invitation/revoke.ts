import { ApiProperty } from "@nestjs/swagger";

export class RevokeInvitationParamsDto {
    @ApiProperty({
        example: "abc-123-def-456",
        description: "Token de la invitación a revocar",
    })
    token!: string;
}

export class RevokeInvitationResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "ID de la invitación revocada",
    })
    invitationId!: string;

    @ApiProperty({
        example: "REVOKED",
        description: "Estado actual de la invitación",
    })
    status!: string;

    @ApiProperty({
        example: "2025-01-15T10:30:00.000Z",
        description: "Fecha y hora en que fue revocada",
        nullable: true,
    })
    revokedAt!: Date | null;
}
