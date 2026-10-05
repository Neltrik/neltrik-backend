import { AntivirusScan } from "../../../domain/value-objects";
import { StubAntivirusAdapter } from "./index";

describe("StubAntivirusAdapter", () => {
    const makeSut = () => {
        const adapter = new StubAntivirusAdapter();
        return { adapter };
    };

    it("should return a clean antivirus scan successfully", async () => {
        const { adapter } = makeSut();
        const buffer = Buffer.from("file-content");
        const result = await adapter.scan(buffer);
        expect(result).toBeInstanceOf(AntivirusScan);
        expect(result.isClean()).toBe(true);
    });

    it("should return a clean scan regardless of the buffer content", async () => {
        const { adapter } = makeSut();
        const firstResult = await adapter.scan(Buffer.from("first-file"));
        const secondResult = await adapter.scan(Buffer.from("second-file"));
        expect(firstResult.isClean()).toBe(true);
        expect(secondResult.isClean()).toBe(true);
    });
});
