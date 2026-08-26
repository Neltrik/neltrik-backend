import { ApiProperty } from "@nestjs/swagger";

export class GetAccountQueryDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "ID del usuario en Identity",
        required: false,
    })
    userId?: string;

    @ApiProperty({
        example: "juan.perez@empresa.com",
        description: "Email del usuario",
        required: false,
    })
    email?: string;
}

export class GetAccountResponseDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440001",
        description: "ID de la cuenta de autenticación",
    })
    id!: string;

    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "ID del usuario en Identity",
    })
    userId!: string;

    @ApiProperty({
        example: "email-password",
        description: "Proveedor de autenticación",
    })
    provider!: string;

    @ApiProperty({
        example: "juan.perez@empresa.com",
        description: "Email del usuario",
    })
    email!: string;

    @ApiProperty({
        example: false,
        description: "Indica si el email ha sido verificado",
    })
    emailVerified!: boolean;

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
}
