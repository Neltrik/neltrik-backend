import { ApiProperty } from "@nestjs/swagger";

export class ChangeFileResourceRequestDto {
    @ApiProperty({
        example: "CANDIDATE",
        description: "Type of the external resource associated with the file.",
    })
    resourceType!: string;

    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "Identifier of the external resource associated with the file.",
    })
    resourceId!: string;
}
