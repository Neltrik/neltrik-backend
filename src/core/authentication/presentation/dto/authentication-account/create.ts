import { ApiProperty } from "@nestjs/swagger";

export class RegisterAccountRequestDto {
    @ApiProperty({
        example: "abc-123-def-456",
        description: "Token de invitación para el registro",
    })
    invitationToken!: string;

    @ApiProperty({
        example: "email-password",
        description: "Proveedor de autenticación (email-password, google, etc.)",
        required: true,
    })
    provider!: string;

    @ApiProperty({
        example: "juan.perez@empresa.com",
        description: "Email del usuario",
    })
    email!: string;

    @ApiProperty({
        example: "MiPasswordSeguro123",
        description: "Contraseña del usuario (solo para provider email-password)",
        required: false,
    })
    password?: string;

    @ApiProperty({
        example: "Juan",
        description: "Nombre del usuario",
    })
    firstName!: string;

    @ApiProperty({
        example: "Perez",
        description: "Apellido del usuario",
    })
    lastName!: string;
}

export class RegisterAccountResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "ID de la cuenta de autenticación creada",
    })
    accountId!: string;
}
