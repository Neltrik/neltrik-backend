import { ApiProperty } from "@nestjs/swagger";

export class ValidateInvitationQueryDto {
    @ApiProperty({
        example: "abc-123-def-456",
        description: "Token de la invitación a validar",
    })
    token!: string;
}

export class ValidateInvitationResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "ID de la invitación",
    })
    invitationId!: string;

    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "ID del Tenant al que pertenece la invitación",
    })
    tenantId!: string;

    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440001",
        description: "ID del rol que se asignará al usuario",
    })
    roleId!: string;

    @ApiProperty({
        example: "juan.perez@empresa.com",
        description: "Email o número de teléfono del destinatario",
    })
    recipient!: string;
}
