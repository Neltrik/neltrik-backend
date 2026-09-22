import { ApiPropertyOptional } from "@nestjs/swagger";

export class PaginationQueryDto {
    @ApiPropertyOptional({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "Cursor para la siguiente página (ID del último item recibido)",
    })
    cursor?: string;

    @ApiPropertyOptional({
        example: 20,
        description: "Cantidad máxima de items a devolver (1-100)",
        default: 20,
    })
    limit: number = 20;
}
