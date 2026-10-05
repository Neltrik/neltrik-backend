import { createHash } from "node:crypto";

import { Injectable } from "@nestjs/common";

import { ChecksumGenerator } from "../../../domain/interfaces";

@Injectable()
export class NodeChecksumGenerator extends ChecksumGenerator {
    public generate(buffer: Buffer): Promise<string> {
        return Promise.resolve(createHash("sha256").update(buffer).digest("hex"));
    }
}
