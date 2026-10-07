import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import type { FilePurpose, FileStatus } from "../../../domain/types";

export class ListFilesQueryDto {
    @ApiPropertyOptional({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "Cursor for the next page (ID of the last item received).",
    })
    cursor?: string;

    @ApiPropertyOptional({
        example: 20,
        description: "Maximum number of items to return (1-100).",
        default: 20,
    })
    limit: number = 20;

    @ApiPropertyOptional({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "Filter by owner user identifier.",
    })
    ownerId?: string;

    @ApiPropertyOptional({
        example: "CANDIDATE",
        description: "Filter by resource type.",
    })
    resourceType?: string;

    @ApiPropertyOptional({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "Filter by resource identifier.",
    })
    resourceId?: string;

    @ApiPropertyOptional({
        example: "CV",
        description: "Filter by purpose.",
    })
    purpose?: FilePurpose;

    @ApiPropertyOptional({
        example: "READY",
        description: "Filter by status.",
    })
    status?: FileStatus;
}

export class ListFilesResponseDto {
    @ApiProperty({
        type: [Object],
        description: "Array of file summaries.",
    })
    files!: unknown[];

    @ApiProperty({
        example: { nextCursor: "550e8400-...", hasMore: true },
        description: "Pagination metadata.",
    })
    meta!: {
        nextCursor: string | null;
        hasMore: boolean;
    };
}
