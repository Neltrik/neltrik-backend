import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

export abstract class IdGenerator {
    public abstract generate(): string;
}

@Injectable()
export class UuidIdGenerator extends IdGenerator {
    public generate(): string {
        return randomUUID();
    }
}
