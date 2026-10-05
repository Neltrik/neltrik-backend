import {
    InvalidFileExtensionError,
    InvalidFileMagicBytesError,
    InvalidFilePurposeError,
    InvalidFileSizeError,
    InvalidMimeTypeError,
} from "../../domain/errors";
import { MagicBytesDetectorSpy } from "../../test-doubles";
import { FileValidationService } from "./index";
import type { FileValidationInput } from "./input";

const makeInput = (): FileValidationInput => ({
    purpose: "DOCUMENT",
    mimeType: "application/pdf",
    extension: "pdf",
    size: 1024,
    buffer: Buffer.from("file-content"),
});

describe("FileValidationService", () => {
    const makeSut = () => {
        const magicBytesDetector = new MagicBytesDetectorSpy();
        const service = new FileValidationService(magicBytesDetector);
        return { service, magicBytesDetector };
    };

    it("should validate a file successfully", async () => {
        const { service, magicBytesDetector } = makeSut();
        const input = makeInput();
        magicBytesDetector.detect.mockResolvedValue("application/pdf");
        await expect(service.validate(input)).resolves.toBeUndefined();
        expect(magicBytesDetector.detect).toHaveBeenCalledTimes(1);
        expect(magicBytesDetector.detect).toHaveBeenCalledWith(input.buffer);
    });

    it("should validate all allowed MIME types for the document purpose", async () => {
        const { service, magicBytesDetector } = makeSut();
        const input: FileValidationInput = {
            ...makeInput(),
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            extension: "docx",
        };
        magicBytesDetector.detect.mockResolvedValue(input.mimeType);
        await expect(service.validate(input)).resolves.toBeUndefined();
        expect(magicBytesDetector.detect).toHaveBeenCalledTimes(1);
        expect(magicBytesDetector.detect).toHaveBeenCalledWith(input.buffer);
    });

    it("should accept jpg extension for image/jpeg", async () => {
        const { service, magicBytesDetector } = makeSut();
        const input: FileValidationInput = { ...makeInput(), mimeType: "image/jpeg", extension: "jpg" };
        magicBytesDetector.detect.mockResolvedValue(input.mimeType);
        await expect(service.validate(input)).resolves.toBeUndefined();
    });

    it("should accept jpeg extension for image/jpeg", async () => {
        const { service, magicBytesDetector } = makeSut();
        const input: FileValidationInput = { ...makeInput(), mimeType: "image/jpeg", extension: "jpeg" };
        magicBytesDetector.detect.mockResolvedValue(input.mimeType);
        await expect(service.validate(input)).resolves.toBeUndefined();
    });

    it("should accept an extension with a leading dot", async () => {
        const { service, magicBytesDetector } = makeSut();
        const input: FileValidationInput = { ...makeInput(), extension: ".pdf" };
        magicBytesDetector.detect.mockResolvedValue(input.mimeType);
        await expect(service.validate(input)).resolves.toBeUndefined();
    });

    it("should accept an uppercase extension", async () => {
        const { service, magicBytesDetector } = makeSut();
        const input: FileValidationInput = { ...makeInput(), extension: "PDF" };
        magicBytesDetector.detect.mockResolvedValue(input.mimeType);
        await expect(service.validate(input)).resolves.toBeUndefined();
    });

    it("should throw InvalidFilePurposeError when purpose is invalid", async () => {
        const { service, magicBytesDetector } = makeSut();
        const input = {
            ...makeInput(),
            purpose: "INVALID_PURPOSE" as unknown as FileValidationInput["purpose"],
        };
        await expect(service.validate(input)).rejects.toThrow(InvalidFilePurposeError);
        expect(magicBytesDetector.detect).not.toHaveBeenCalled();
    });

    it("should throw InvalidMimeTypeError when MIME type is not allowed", async () => {
        const { service, magicBytesDetector } = makeSut();
        const input: FileValidationInput = { ...makeInput(), mimeType: "text/plain" };
        await expect(service.validate(input)).rejects.toThrow(InvalidMimeTypeError);
        expect(magicBytesDetector.detect).not.toHaveBeenCalled();
    });

    it("should throw InvalidFileExtensionError when extension does not match MIME type", async () => {
        const { service, magicBytesDetector } = makeSut();
        const input: FileValidationInput = { ...makeInput(), extension: "txt" };
        await expect(service.validate(input)).rejects.toThrow(InvalidFileExtensionError);
        expect(magicBytesDetector.detect).not.toHaveBeenCalled();
    });

    it("should throw InvalidFileMagicBytesError when magic bytes do not match MIME type", async () => {
        const { service, magicBytesDetector } = makeSut();
        const input = makeInput();
        magicBytesDetector.detect.mockResolvedValue("image/png");
        await expect(service.validate(input)).rejects.toThrow(InvalidFileMagicBytesError);
        expect(magicBytesDetector.detect).toHaveBeenCalledTimes(1);
        expect(magicBytesDetector.detect).toHaveBeenCalledWith(input.buffer);
    });

    it("should throw InvalidFileSizeError when size is zero", async () => {
        const { service, magicBytesDetector } = makeSut();
        const input: FileValidationInput = { ...makeInput(), size: 0 };
        magicBytesDetector.detect.mockResolvedValue(input.mimeType);
        await expect(service.validate(input)).rejects.toThrow(InvalidFileSizeError);
        expect(magicBytesDetector.detect).toHaveBeenCalledTimes(1);
    });

    it("should throw InvalidFileSizeError when size is negative", async () => {
        const { service, magicBytesDetector } = makeSut();
        const input: FileValidationInput = { ...makeInput(), size: -1 };
        magicBytesDetector.detect.mockResolvedValue(input.mimeType);
        await expect(service.validate(input)).rejects.toThrow(InvalidFileSizeError);
        expect(magicBytesDetector.detect).toHaveBeenCalledTimes(1);
    });

    it("should throw InvalidFileSizeError when size exceeds the purpose limit", async () => {
        const { service, magicBytesDetector } = makeSut();
        const input: FileValidationInput = { ...makeInput(), size: 1024 * 1024 * 100 };
        magicBytesDetector.detect.mockResolvedValue(input.mimeType);
        await expect(service.validate(input)).rejects.toThrow(InvalidFileSizeError);
        expect(magicBytesDetector.detect).toHaveBeenCalledTimes(1);
    });

    it("should allow a file whose size is exactly the maximum allowed", async () => {
        const { service, magicBytesDetector } = makeSut();
        const input: FileValidationInput = { ...makeInput(), size: 10 * 1024 * 1024 };
        magicBytesDetector.detect.mockResolvedValue(input.mimeType);
        await expect(service.validate(input)).resolves.toBeUndefined();
    });

    it("should validate image/png files successfully", async () => {
        const { service, magicBytesDetector } = makeSut();
        const input: FileValidationInput = {
            ...makeInput(),
            purpose: "DOCUMENT",
            mimeType: "image/png",
            extension: "png",
        };
        magicBytesDetector.detect.mockResolvedValue("image/png");
        await expect(service.validate(input)).resolves.toBeUndefined();
        expect(magicBytesDetector.detect).toHaveBeenCalledTimes(1);
        expect(magicBytesDetector.detect).toHaveBeenCalledWith(input.buffer);
    });

    it("should validate image/webp files successfully", async () => {
        const { service, magicBytesDetector } = makeSut();
        const input: FileValidationInput = {
            ...makeInput(),
            purpose: "AVATAR",
            mimeType: "image/webp",
            extension: "webp",
        };
        magicBytesDetector.detect.mockResolvedValue("image/webp");
        await expect(service.validate(input)).resolves.toBeUndefined();
        expect(magicBytesDetector.detect).toHaveBeenCalledTimes(1);
        expect(magicBytesDetector.detect).toHaveBeenCalledWith(input.buffer);
    });

    it("should return no extensions for an unsupported MIME type", () => {
        const { service } = makeSut();
        type FileValidationServiceInternals = {
            mimeTypeToExtensions: (mimeType: string) => string[];
        };
        const internals = service as unknown as FileValidationServiceInternals;
        expect(internals.mimeTypeToExtensions("application/octet-stream")).toEqual([]);
    });
});
