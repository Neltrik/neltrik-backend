export abstract class MagicBytesDetector {
    abstract detect(buffer: Buffer): Promise<string | null>;
}
