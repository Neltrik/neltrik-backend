import { ApiProperty } from "@nestjs/swagger";

export class ReplaceFileRequestDto {
    @ApiProperty({
        type: "string",
        format: "binary",
        description: "The new file to replace the current one.",
    })
    file!: unknown;
}
