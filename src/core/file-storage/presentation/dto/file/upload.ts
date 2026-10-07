import { ApiProperty } from "@nestjs/swagger";

import type { FilePurpose } from "../../../domain/types";

export class UploadFileRequestDto {
    @ApiProperty({
        type: "string",
        format: "binary",
        description: "The file to upload.",
    })
    file!: unknown;

    @ApiProperty({
        example: "CV",
        description: "Purpose of the file.",
        enum: ["CV", "AVATAR", "DOCUMENT"],
    })
    purpose!: FilePurpose;

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
