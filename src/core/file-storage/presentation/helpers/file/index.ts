import { BadRequestException } from "@nestjs/common";

export class FileHelper {
    public static extractExtension(filename: string): string {
        const parts = filename.split(".");
        if (parts.length < 2) {
            throw new BadRequestException("File must have an extension.");
        }
        return parts[parts.length - 1] ?? "";
    }
}
