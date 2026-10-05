import { Injectable } from "@nestjs/common";
import { fileTypeFromBuffer } from "file-type";

import { MagicBytesDetector } from "../../../domain/interfaces";

@Injectable()
export class FileTypeMagicBytesDetector extends MagicBytesDetector {
    public async detect(buffer: Buffer): Promise<string | null> {
        const result = await fileTypeFromBuffer(buffer);
        return result?.mime ?? null;
    }
}
