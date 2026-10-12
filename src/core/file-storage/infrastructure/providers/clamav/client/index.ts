import { createConnection } from "node:net";

const INSTREAM_COMMAND = "zINSTREAM\0";
const CHUNK_SIZE = 64 * 1024;

export class ClamavClient {
    constructor(
        private readonly host: string,
        private readonly port: number,
        private readonly timeoutMs: number,
    ) {}

    public scanBuffer(buffer: Buffer): Promise<string> {
        return new Promise((resolve, reject) => {
            const socket = createConnection({ host: this.host, port: this.port });
            const chunks: Buffer[] = [];
            let finished = false;
            const onTimeout = (): void => {
                socket.destroy(new Error(`ClamAV scan timed out after ${this.timeoutMs}ms`));
            };
            const onError = (error: Error): void => {
                if (finished) {
                    return;
                }
                finished = true;
                reject(error);
            };
            const onClose = (): void => {
                if (finished) {
                    return;
                }
                finished = true;
                resolve(Buffer.concat(chunks).toString("utf8"));
            };
            socket.setTimeout(this.timeoutMs);
            socket.on("timeout", onTimeout);
            socket.on("error", onError);
            socket.on("data", (chunk: Buffer) => {
                chunks.push(chunk);
            });
            socket.on("close", onClose);
            socket.on("connect", () => {
                socket.write(INSTREAM_COMMAND);
                let offset = 0;
                const writeNextChunk = (): void => {
                    while (offset < buffer.length) {
                        const end = Math.min(offset + CHUNK_SIZE, buffer.length);
                        const chunk = buffer.subarray(offset, end);
                        const lengthHeader = Buffer.alloc(4);
                        lengthHeader.writeUInt32BE(chunk.length, 0);
                        const canWriteHeader = socket.write(lengthHeader);
                        const canWriteChunk = socket.write(chunk);
                        offset = end;
                        if (!canWriteHeader || !canWriteChunk) {
                            socket.once("drain", writeNextChunk);
                            return;
                        }
                    }
                    const terminator = Buffer.alloc(4);
                    terminator.writeUInt32BE(0, 0);
                    socket.write(terminator);
                };
                writeNextChunk();
            });
        });
    }
}
