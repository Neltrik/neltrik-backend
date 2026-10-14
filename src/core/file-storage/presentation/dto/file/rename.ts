import { ApiProperty } from "@nestjs/swagger";

export class RenameFileRequestDto {
    @ApiProperty({
        example: "cv_2024.pdf",
        description: "New name for the file.",
    })
    name!: string;
}
