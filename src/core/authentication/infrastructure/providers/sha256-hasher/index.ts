import { Injectable } from "@nestjs/common";
import { createHash } from "crypto";

@Injectable()
export class Sha256Hasher {
    public hash(value: string): string {
        return createHash("sha256").update(value).digest("hex");
    }
}
