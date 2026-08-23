import { ApiProperty } from "@nestjs/swagger";

export class ListInvitationsParamsDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "ID del Tenant",
    })
    tenantId!: string;
}

class ListInvitationsItemDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440001",
        description: "ID de la invitación",
    })
    id!: string;

    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440002",
        description: "ID del rol asignado",
    })
    roleId!: string;

    @ApiProperty({
        example: "juan.perez@empresa.com",
        description: "Email o número de teléfono del destinatario",
    })
    recipient!: string;

    @ApiProperty({
        example: "manual",
        description: "Mecanismo de entrega",
    })
    mechanism!: string;

    @ApiProperty({
        example: "PENDING",
        description: "Estado de la invitación",
    })
    status!: string;

    @ApiProperty({
        example: "2025-01-15T10:30:00.000Z",
        description: "Fecha de expiración",
    })
    expiresAt!: Date;

    @ApiProperty({
        example: "2025-01-15T10:30:00.000Z",
        description: "Fecha de creación",
    })
    createdAt!: Date;

    @ApiProperty({
        example: "2025-01-15T10:30:00.000Z",
        description: "Fecha de última actualización",
    })
    updatedAt!: Date;

    @ApiProperty({
        example: null,
        description: "Fecha en que fue usada (null si no ha sido usada)",
        nullable: true,
    })
    usedAt!: Date | null;

    @ApiProperty({
        example: null,
        description: "Fecha en que fue revocada (null si no ha sido revocada)",
        nullable: true,
    })
    revokedAt!: Date | null;
}

export class ListInvitationsResultDto {
    @ApiProperty({
        type: [ListInvitationsItemDto],
        description: "Lista de invitaciones del Tenant",
    })
    items!: ListInvitationsItemDto[];
}
