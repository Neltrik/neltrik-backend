import { fileTypeFromBuffer } from "file-type";

import { FileTypeMagicBytesDetector } from "./index";

jest.mock(
    "file-type",
    () => ({
        fileTypeFromBuffer: jest.fn(),
    }),
    { virtual: true },
);

describe("FileTypeMagicBytesDetector", () => {
    const makeSut = () => {
        const detector = new FileTypeMagicBytesDetector();
        return { detector };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the detected MIME type", async () => {
        const { detector } = makeSut();
        const buffer = Buffer.from("file-content");
        jest.mocked(fileTypeFromBuffer).mockResolvedValue({ ext: "pdf", mime: "application/pdf" });
        await expect(detector.detect(buffer)).resolves.toBe("application/pdf");
        expect(fileTypeFromBuffer).toHaveBeenCalledTimes(1);
        expect(fileTypeFromBuffer).toHaveBeenCalledWith(buffer);
    });

    it("should return null when the file type cannot be detected", async () => {
        const { detector } = makeSut();
        const buffer = Buffer.from("unknown-content");
        jest.mocked(fileTypeFromBuffer).mockResolvedValue(undefined);
        await expect(detector.detect(buffer)).resolves.toBeNull();
        expect(fileTypeFromBuffer).toHaveBeenCalledTimes(1);
        expect(fileTypeFromBuffer).toHaveBeenCalledWith(buffer);
    });

    it("should propagate errors from file-type", async () => {
        const { detector } = makeSut();
        const buffer = Buffer.from("file-content");
        jest.mocked(fileTypeFromBuffer).mockRejectedValue(new Error("Detection failed"));
        await expect(detector.detect(buffer)).rejects.toThrow("Detection failed");
        expect(fileTypeFromBuffer).toHaveBeenCalledTimes(1);
        expect(fileTypeFromBuffer).toHaveBeenCalledWith(buffer);
    });
});
