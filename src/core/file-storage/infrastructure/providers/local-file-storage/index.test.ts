import * as fs from "node:fs/promises";
import * as path from "node:path";

import { LocalFileStorageAdapter } from "./index";

jest.mock("node:fs/promises", () => ({
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
    rm: jest.fn(),
    rmdir: jest.fn(),
    access: jest.fn(),
    readdir: jest.fn(),
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

        it("should remove empty parent directories after deleting the file", async () => {
            const adapter = new LocalFileStorageAdapter();
            jest.mocked(fs.rm).mockResolvedValue(undefined);
            jest.mocked(fs.rmdir).mockResolvedValue(undefined);
            await adapter.delete(key);
            expect(fs.rm).toHaveBeenCalledWith(filePath, { force: true });
            expect(fs.rmdir).toHaveBeenCalledWith(path.join(basePath, "files"));
        });

        it("should stop removing parent directories when rmdir fails", async () => {
            const adapter = new LocalFileStorageAdapter();
            jest.mocked(fs.rm).mockResolvedValue(undefined);
            jest.mocked(fs.rmdir).mockRejectedValue(new Error("Directory not empty"));
            await expect(adapter.delete(key)).resolves.toBeUndefined();
            expect(fs.rmdir).toHaveBeenCalledTimes(1);
            expect(fs.rmdir).toHaveBeenCalledWith(path.join(basePath, "files"));
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

    describe("list", () => {
        it("should list files recursively with a normalized prefix", async () => {
            const adapter = new LocalFileStorageAdapter();
            jest.mocked(fs.readdir)
                .mockResolvedValueOnce([
                    { name: "document.pdf", isDirectory: () => false, isFile: () => true },
                    { name: "nested", isDirectory: () => true, isFile: () => false },
                ] as never)
                .mockResolvedValueOnce([{ name: "image.png", isDirectory: () => false, isFile: () => true }] as never);
            await expect(adapter.list("files")).resolves.toEqual(["files/document.pdf", "files/nested/image.png"]);
            expect(fs.readdir).toHaveBeenCalledTimes(2);
            expect(fs.readdir).toHaveBeenNthCalledWith(1, path.join(basePath, "files/"), { withFileTypes: true });
            expect(fs.readdir).toHaveBeenNthCalledWith(2, path.join(basePath, "files/", "nested"), {
                withFileTypes: true,
            });
        });

        it("should return an empty array when the directory does not exist", async () => {
            const adapter = new LocalFileStorageAdapter();
            jest.mocked(fs.readdir).mockRejectedValue(new Error("Directory not found"));
            await expect(adapter.list("files/")).resolves.toEqual([]);
        });
    });
});
