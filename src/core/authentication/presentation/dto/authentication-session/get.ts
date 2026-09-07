import { ApiProperty } from "@nestjs/swagger";

export class SessionParamsDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "ID de la sesión",
    })
    id!: string;
}
