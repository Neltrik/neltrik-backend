import { createHash } from "node:crypto";

import { NodeChecksumGenerator } from "./index";

describe("NodeChecksumGenerator", () => {
    const makeSut = () => {
        const generator = new NodeChecksumGenerator();
        return { generator };
    };

    it("should generate a SHA-256 checksum successfully", async () => {
        const { generator } = makeSut();
        const buffer = Buffer.from("hello world");
        const expectedChecksum = createHash("sha256").update(buffer).digest("hex");
        await expect(generator.generate(buffer)).resolves.toBe(expectedChecksum);
    });

    it("should generate the same checksum for the same content", async () => {
        const { generator } = makeSut();
        const firstBuffer = Buffer.from("file content");
        const secondBuffer = Buffer.from("file content");
        const firstChecksum = await generator.generate(firstBuffer);
        const secondChecksum = await generator.generate(secondBuffer);
        expect(firstChecksum).toBe(secondChecksum);
    });

    it("should generate different checksums for different content", async () => {
        const { generator } = makeSut();
        const firstBuffer = Buffer.from("file content");
        const secondBuffer = Buffer.from("different file content");
        const firstChecksum = await generator.generate(firstBuffer);
        const secondChecksum = await generator.generate(secondBuffer);
        expect(firstChecksum).not.toBe(secondChecksum);
    });

    it("should generate the SHA-256 checksum for an empty buffer", async () => {
        const { generator } = makeSut();
        const buffer = Buffer.alloc(0);
        const expectedChecksum = createHash("sha256").update(buffer).digest("hex");
        await expect(generator.generate(buffer)).resolves.toBe(expectedChecksum);
    });
});
