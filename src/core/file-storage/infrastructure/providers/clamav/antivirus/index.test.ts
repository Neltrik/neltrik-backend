import { AntivirusScan } from "../../../../domain/value-objects";
import { ClamavClient } from "../client";
import { ClamavAntivirusAdapter } from "./index";

describe("ClamavAntivirusAdapter", () => {
    const makeSut = () => {
        const scanBufferSpy = jest.spyOn(ClamavClient.prototype, "scanBuffer");
        const adapter = new ClamavAntivirusAdapter();
        return { adapter, scanBufferSpy };
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should return a clean antivirus scan successfully", async () => {
        const { adapter, scanBufferSpy } = makeSut();
        const buffer = Buffer.from("file-content");
        scanBufferSpy.mockResolvedValue("stream: OK");
        const result = await adapter.scan(buffer);
        expect(result).toBeInstanceOf(AntivirusScan);
        expect(result.isClean()).toBe(true);
        expect(scanBufferSpy).toHaveBeenCalledWith(buffer);
    });

    it("should return an infected scan when a virus is detected", async () => {
        const { adapter, scanBufferSpy } = makeSut();
        scanBufferSpy.mockResolvedValue("stream: Eicar-Test-Signature FOUND");
        const result = await adapter.scan(Buffer.from("infected-file"));
        expect(result).toBeInstanceOf(AntivirusScan);
        expect(result.isInfected()).toBe(true);
    });

    it("should return an infected scan with unknown virus name", async () => {
        const { adapter, scanBufferSpy } = makeSut();
        scanBufferSpy.mockResolvedValue("FOUND");
        const result = await adapter.scan(Buffer.from("infected-file"));
        expect(result.isInfected()).toBe(true);
    });

    it("should return an error scan when ClamAV returns an error", async () => {
        const { adapter, scanBufferSpy } = makeSut();
        scanBufferSpy.mockResolvedValue("stream: ERROR");
        const result = await adapter.scan(Buffer.from("file-content"));
        expect(result).toBeInstanceOf(AntivirusScan);
    });

    it("should return an error scan when ClamAV returns an error", async () => {
        const { adapter, scanBufferSpy } = makeSut();
        scanBufferSpy.mockResolvedValue("stream: ERROR");
        const result = await adapter.scan(Buffer.from("file-content"));
        expect(result).toBeInstanceOf(AntivirusScan);
    });

    it("should return an error scan when the client throws an Error", async () => {
        const { adapter, scanBufferSpy } = makeSut();
        scanBufferSpy.mockRejectedValue(new Error("Connection refused"));
        const result = await adapter.scan(Buffer.from("file-content"));
        expect(result).toBeInstanceOf(AntivirusScan);
    });

    it("should return an error scan when the client throws a non-Error value", async () => {
        const { adapter, scanBufferSpy } = makeSut();
        scanBufferSpy.mockRejectedValue("unexpected failure");
        const result = await adapter.scan(Buffer.from("file-content"));
        expect(result).toBeInstanceOf(AntivirusScan);
    });

    it("should handle whitespace around a clean reply", async () => {
        const { adapter, scanBufferSpy } = makeSut();
        scanBufferSpy.mockResolvedValue("  stream: OK  \n");
        const result = await adapter.scan(Buffer.from("file-content"));
        expect(result.isClean()).toBe(true);
    });

    it("should return an error scan when the reply is unexpected", async () => {
        const { adapter, scanBufferSpy } = makeSut();
        scanBufferSpy.mockResolvedValue("unexpected response");
        const result = await adapter.scan(Buffer.from("file-content"));
        expect(result).toBeInstanceOf(AntivirusScan);
    });
});
