export abstract class ChecksumGenerator {
    abstract generate(buffer: Buffer): Promise<string>;
}
