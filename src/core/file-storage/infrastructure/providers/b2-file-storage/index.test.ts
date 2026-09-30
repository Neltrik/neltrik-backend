import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { B2FileStorageAdapter } from "./index";

jest.mock("@aws-sdk/s3-request-presigner", () => ({
    getSignedUrl: jest.fn(),
}));

const makeSut = () => {
    const fileStorage = new B2FileStorageAdapter();
    const sendSpy = jest.spyOn(S3Client.prototype, "send");
    return { fileStorage, sendSpy };
};

describe("B2FileStorageAdapter", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("upload", () => {
        it("should upload a file", async () => {
            const { fileStorage, sendSpy } = makeSut();
            sendSpy.mockImplementation(() => Promise.resolve(undefined) as never);
            const buffer = Buffer.from("file content");
            await fileStorage.upload("files/document.pdf", buffer, "application/pdf");
            expect(sendSpy).toHaveBeenCalledTimes(1);
            const command = sendSpy.mock.calls[0]![0];
            expect(command).toBeInstanceOf(PutObjectCommand);
            expect(command.input).toEqual(
                expect.objectContaining({ Key: "files/document.pdf", Body: buffer, ContentType: "application/pdf" }),
            );
        });
    });

    describe("download", () => {
        it("should download and concatenate file chunks", async () => {
            const { fileStorage, sendSpy } = makeSut();
            sendSpy.mockImplementation(
                () =>
                    Promise.resolve({
                        Body: (function* () {
                            yield Buffer.from("hello ");
                            yield Buffer.from("world");
                        })(),
                    }) as never,
            );
            const result = await fileStorage.download("files/document.pdf");
            expect(result).toEqual(Buffer.from("hello world"));
            expect(sendSpy).toHaveBeenCalledTimes(1);
            const command = sendSpy.mock.calls[0]![0];
            expect(command).toBeInstanceOf(GetObjectCommand);
            expect(command.input).toEqual(expect.objectContaining({ Key: "files/document.pdf" }));
        });
    });

    describe("delete", () => {
        it("should delete a file", async () => {
            const { fileStorage, sendSpy } = makeSut();
            sendSpy.mockImplementation(() => Promise.resolve(undefined) as never);
            await fileStorage.delete("files/document.pdf");
            expect(sendSpy).toHaveBeenCalledTimes(1);
            const command = sendSpy.mock.calls[0]![0];
            expect(command).toBeInstanceOf(DeleteObjectCommand);
            expect(command.input).toEqual(expect.objectContaining({ Key: "files/document.pdf" }));
        });
    });

    describe("getSignedUrl", () => {
        it("should return a signed URL", async () => {
            const { fileStorage } = makeSut();
            const signedUrl = "https://example.com/signed-url";
            jest.mocked(getSignedUrl).mockResolvedValue(signedUrl);
            const result = await fileStorage.getSignedUrl("files/document.pdf", 3600);
            expect(result).toBe(signedUrl);
            expect(getSignedUrl).toHaveBeenCalledTimes(1);
            expect(getSignedUrl).toHaveBeenCalledWith(expect.any(S3Client), expect.any(GetObjectCommand), {
                expiresIn: 3600,
            });
            const command = jest.mocked(getSignedUrl).mock.calls[0]![1];
            expect(command).toBeInstanceOf(GetObjectCommand);
            expect(command.input).toEqual(expect.objectContaining({ Key: "files/document.pdf" }));
        });
    });

    describe("exists", () => {
        it("should return true when the file exists", async () => {
            const { fileStorage, sendSpy } = makeSut();
            sendSpy.mockImplementation(() => Promise.resolve(undefined) as never);
            const result = await fileStorage.exists("files/document.pdf");
            expect(result).toBe(true);
            expect(sendSpy).toHaveBeenCalledTimes(1);
            const command = sendSpy.mock.calls[0]![0];
            expect(command).toBeInstanceOf(HeadObjectCommand);
            expect(command.input).toEqual(expect.objectContaining({ Key: "files/document.pdf" }));
        });

        it("should return false when the file does not exist", async () => {
            const { fileStorage, sendSpy } = makeSut();
            sendSpy.mockImplementation(() => Promise.reject(new Error("Not found")) as never);
            const result = await fileStorage.exists("files/document.pdf");
            expect(result).toBe(false);
            expect(sendSpy).toHaveBeenCalledTimes(1);
            const command = sendSpy.mock.calls[0]![0] as HeadObjectCommand;
            expect(command).toBeInstanceOf(HeadObjectCommand);
            expect(command.input).toEqual(expect.objectContaining({ Key: "files/document.pdf" }));
        });
    });
});
