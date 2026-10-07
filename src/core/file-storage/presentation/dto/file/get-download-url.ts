import { ApiProperty } from "@nestjs/swagger";

export class GetDownloadUrlResponseDto {
    @ApiProperty({
        example: "https://s3.us-west-004.backblazeb2.com/neltrik-files/...",
        description: "Signed URL to download the file.",
    })
    url!: string;

    @ApiProperty({
        example: 900,
        description: "Time in seconds until the URL expires.",
    })
    expiresIn!: number;

    @ApiProperty({
        example: "cv_juan_2025.pdf",
        description: "Original name of the file.",
    })
    name!: string;

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
}
