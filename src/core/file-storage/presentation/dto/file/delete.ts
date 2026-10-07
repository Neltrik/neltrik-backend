import { ApiProperty } from "@nestjs/swagger";

export class DeleteFileResponseDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "Identifier of the deleted file.",
    })
    id!: string;
}
