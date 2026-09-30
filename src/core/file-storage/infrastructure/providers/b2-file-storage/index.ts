import { Injectable } from "@nestjs/common";
import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/config/index";

import { FileStoragePort } from "../../../domain/interfaces";

@Injectable()
export class B2FileStorageAdapter extends FileStoragePort {
    private readonly client: S3Client;
    private readonly bucket = env.B2_BUCKET;

    constructor() {
        super();
        this.client = new S3Client({
            endpoint: env.B2_ENDPOINT,
            region: env.B2_REGION,
            credentials: { accessKeyId: env.B2_ACCESS_KEY_ID, secretAccessKey: env.B2_SECRET_ACCESS_KEY },
        });
    }

    public async upload(key: string, buffer: Buffer, mimeType: string): Promise<void> {
        await this.client.send(
            new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buffer, ContentType: mimeType }),
        );
    }

    public async download(key: string): Promise<Buffer> {
        const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
        const chunks: Buffer[] = [];
        for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
            chunks.push(Buffer.from(chunk));
        }
        return Buffer.concat(chunks);
    }

    public async delete(key: string): Promise<void> {
        await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    }

    public async getSignedUrl(key: string, ttlSeconds: number): Promise<string> {
        return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
            expiresIn: ttlSeconds,
        });
    }

    public async exists(key: string): Promise<boolean> {
        try {
            await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
            return true;
        } catch {
            return false;
        }
    }
}
