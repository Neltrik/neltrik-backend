import * as fs from "node:fs/promises";
import * as path from "node:path";

import { LocalFileStorageAdapter } from "./index";

jest.mock("node:fs/promises", () => ({
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
    rm: jest.fn(),
    access: jest.fn(),
}));

describe("LocalFileStorageAdapter", () => {
    const key = "files/document.pdf";
    const buffer = Buffer.from("file content");
    const basePath = path.resolve(process.cwd(), "tmp", "storage");
    const filePath = path.join(basePath, key);

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(fs.mkdir).mockResolvedValue(undefined);
    });

    describe("upload", () => {
        it("should create the directory and write the file", async () => {
            const adapter = new LocalFileStorageAdapter();
            jest.mocked(fs.writeFile).mockResolvedValue(undefined);
            await adapter.upload(key, buffer, "application/pdf");
            expect(fs.mkdir).toHaveBeenCalled();
            expect(fs.writeFile).toHaveBeenCalledWith(filePath, buffer);
        });
    });

    describe("download", () => {
        it("should return the file contents", async () => {
            const adapter = new LocalFileStorageAdapter();
            jest.mocked(fs.readFile).mockResolvedValue(buffer);
            const result = await adapter.download(key);
            expect(result).toEqual(buffer);
            expect(fs.readFile).toHaveBeenCalledWith(filePath);
        });
    });

    describe("delete", () => {
        it("should remove the file", async () => {
            const adapter = new LocalFileStorageAdapter();
            jest.mocked(fs.rm).mockResolvedValue(undefined);
            await adapter.delete(key);
            expect(fs.rm).toHaveBeenCalledWith(filePath, { force: true });
        });
    });

    describe("getSignedUrl", () => {
        it("should return the storage URL", async () => {
            const adapter = new LocalFileStorageAdapter();
            const result = await adapter.getSignedUrl(key, 3600);
            expect(result).toContain(`/storage/${key}`);
        });
    });

    describe("exists", () => {
        it("should return true when the file exists", async () => {
            const adapter = new LocalFileStorageAdapter();
            jest.mocked(fs.access).mockResolvedValue(undefined);
            const result = await adapter.exists(key);
            expect(result).toBe(true);
            expect(fs.access).toHaveBeenCalledWith(filePath);
        });

        it("should return false when the file does not exist", async () => {
            const adapter = new LocalFileStorageAdapter();
            jest.mocked(fs.access).mockRejectedValue(new Error("File not found"));
            const result = await adapter.exists(key);
            expect(result).toBe(false);
            expect(fs.access).toHaveBeenCalledWith(filePath);
        });
    });
});
