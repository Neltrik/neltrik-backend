export interface ReplaceFileInput {
    fileId: string;
    buffer: Buffer;
    name: string;
    extension: string;
    mimeType: string;
    size: number;
}
