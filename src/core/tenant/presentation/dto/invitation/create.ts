import { ApiProperty } from "@nestjs/swagger";

export class CreateInvitationRequestDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "ID del Tenant que genera la invitación",
    })
    tenantId!: string;

    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440001",
        description: "ID del rol que se asignará al usuario invitado",
    })
    roleId!: string;

    @ApiProperty({
        example: "juan.perez@empresa.com",
        description: "Email o número de teléfono del destinatario",
    })
    recipient!: string;

    @ApiProperty({
        example: "manual",
        description: "Mecanismo de entrega (manual, email, sms, etc.)",
        required: false,
        default: "manual",
    })
    mechanism!: string;
}

export class CreateInvitationResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440002",
        description: "ID de la invitación creada",
    })
    invitationId!: string;

    @ApiProperty({
        example: "https://neltrik.com/auth/register?token=abc-123-def-456",
        description: "Enlace mágico para que el invitado se registre",
        required: false,
    })
    magicLink!: string;
}
