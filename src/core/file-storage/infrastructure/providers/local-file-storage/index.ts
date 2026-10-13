import { type Dirent } from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { Injectable } from "@nestjs/common";

import { env } from "@/config/index";

import { FileStoragePort } from "../../../domain/interfaces";

@Injectable()
export class LocalFileStorageAdapter extends FileStoragePort {
    private readonly basePath = path.resolve(process.cwd(), "tmp", "storage");
    private readonly baseUrl = `${env.FRONTEND_URL}/storage`;

    constructor() {
        super();
        fs.mkdir(this.basePath, { recursive: true }).catch(() => undefined);
    }

    public async upload(key: string, buffer: Buffer, _mimeType: string): Promise<void> {
        const filePath = this.resolvePath(key);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, buffer);
    }

    public async download(key: string): Promise<Buffer> {
        const filePath = this.resolvePath(key);
        return fs.readFile(filePath);
    }

    public async delete(key: string): Promise<void> {
        const filePath = this.resolvePath(key);
        await fs.rm(filePath, { force: true });
    }

    public async getSignedUrl(key: string, _ttlSeconds: number): Promise<string> {
        return Promise.resolve(`${this.baseUrl}/${key}`);
    }

    public async exists(key: string): Promise<boolean> {
        const filePath = this.resolvePath(key);
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    public async list(prefix: string): Promise<string[]> {
        const normalizedPrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;
        const dirPath = this.resolvePath(normalizedPrefix);
        const keys: string[] = [];
        await this.walk(dirPath, normalizedPrefix, keys);
        return keys;
    }

    private async walk(dirPath: string, prefix: string, keys: string[]): Promise<void> {
        let entries: Dirent[];
        try {
            entries = await fs.readdir(dirPath, { withFileTypes: true });
        } catch {
            return;
        }
        for (const entry of entries) {
            const entryPath = path.join(dirPath, entry.name);
            const entryKey = path.posix.join(prefix, entry.name);
            if (entry.isDirectory()) {
                await this.walk(entryPath, entryKey, keys);
            } else if (entry.isFile()) {
                keys.push(entryKey);
            }
        }
    }

    private resolvePath(key: string): string {
        return path.join(this.basePath, key);
    }
}
