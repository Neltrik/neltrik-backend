import type { AntivirusScan } from "../../value-objects";

export abstract class AntivirusPort {
    abstract scan(buffer: Buffer): Promise<AntivirusScan>;
}
