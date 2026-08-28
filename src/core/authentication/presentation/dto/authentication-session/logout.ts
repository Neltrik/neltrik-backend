import { ApiProperty } from "@nestjs/swagger";

export class LogoutRequestDto {
    @ApiProperty({
        example: "abc-123-def-456",
        description: "Refresh Token (UUID)",
    })
    refreshToken!: string;
}
