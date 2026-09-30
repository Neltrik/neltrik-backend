export abstract class FileStoragePort {
    abstract upload(key: string, buffer: Buffer, mimeType: string): Promise<void>;
    abstract download(key: string): Promise<Buffer>;
    abstract delete(key: string): Promise<void>;
    abstract getSignedUrl(key: string, ttlSeconds: number): Promise<string>;
    abstract exists(key: string): Promise<boolean>;
}
