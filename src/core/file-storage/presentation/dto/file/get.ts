import { ApiProperty } from "@nestjs/swagger";

export class GetFileResponseDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "Unique identifier of the file.",
    })
    id!: string;

    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "Identifier of the tenant that owns the file.",
    })
    tenantId!: string;

    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "Identifier of the user that owns the file.",
    })
    ownerId!: string;

    @ApiProperty({
        example: "cv_juan_2025.pdf",
        description: "Original name of the file.",
    })
    name!: string;

    @ApiProperty({
        example: "pdf",
        description: "File extension.",
    })
    extension!: string;

    @ApiProperty({
        example: "application/pdf",
        description: "MIME type of the file.",
    })
    mimeType!: string;

    @ApiProperty({
        example: 204800,
        description: "File size, in bytes.",
    })
    size!: number;

    @ApiProperty({
        example: "CV",
        description: "Purpose of the file.",
    })
    purpose!: string;

    @ApiProperty({
        example: "READY",
        description: "Current status of the file.",
    })
    status!: string;

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

    @ApiProperty({
        example: "2026-10-06T12:00:00.000Z",
        description: "Date when the file was created.",
    })
    createdAt!: Date;

    @ApiProperty({
        example: "2026-10-06T12:00:00.000Z",
        description: "Date when the file was last updated.",
    })
    updatedAt!: Date;

    @ApiProperty({
        example: null,
        description: "Date when the file was logically deleted, if applicable.",
        nullable: true,
    })
    deletedAt!: Date | null;
}
