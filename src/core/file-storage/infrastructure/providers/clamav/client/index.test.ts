import { EventEmitter } from "node:events";
import { createConnection, type Socket } from "node:net";

import { ClamavClient } from "./index";

jest.mock("node:net", () => ({
    createConnection: jest.fn(),
}));

describe("ClamavClient", () => {
    const HOST = "localhost";
    const PORT = 3310;
    const TIMEOUT_MS = 5000;
    const CHUNK_SIZE = 64 * 1024;

    const makeSut = () => {
        const socketEmitter = new EventEmitter();
        const socket = Object.assign(socketEmitter, {
            setTimeout: jest.fn(),
            write: jest.fn((): boolean => true),
            destroy: jest.fn((error?: Error) => {
                if (error) {
                    socketEmitter.emit("error", error);
                }
                return socketEmitter;
            }),
        }) as unknown as Socket;
        jest.mocked(createConnection).mockReturnValue(socket);
        const client = new ClamavClient(HOST, PORT, TIMEOUT_MS);
        return { client, socket, socketEmitter };
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should create a connection with the configured host and port", async () => {
        const { client, socketEmitter } = makeSut();
        const promise = client.scanBuffer(Buffer.from("file-content"));
        expect(createConnection).toHaveBeenCalledWith({ host: HOST, port: PORT });
        socketEmitter.emit("connect");
        await Promise.resolve();
        socketEmitter.emit("close");
        await expect(promise).resolves.toBe("");
    });

    it("should configure the socket timeout", async () => {
        const { client, socket, socketEmitter } = makeSut();
        const promise = client.scanBuffer(Buffer.from("file-content"));
        expect(socket.setTimeout).toHaveBeenCalledWith(TIMEOUT_MS);
        socketEmitter.emit("connect");
        socketEmitter.emit("close");
        await expect(promise).resolves.toBe("");
    });

    it("should send the INSTREAM command and the buffer", async () => {
        const { client, socket, socketEmitter } = makeSut();
        const buffer = Buffer.from("file-content");
        const promise = client.scanBuffer(buffer);
        socketEmitter.emit("connect");
        expect(socket.write).toHaveBeenNthCalledWith(1, "zINSTREAM\0");
        const lengthHeader = Buffer.alloc(4);
        lengthHeader.writeUInt32BE(buffer.length, 0);
        expect(socket.write).toHaveBeenNthCalledWith(2, lengthHeader);
        expect(socket.write).toHaveBeenNthCalledWith(3, buffer);
        const terminator = Buffer.alloc(4);
        terminator.writeUInt32BE(0, 0);
        expect(socket.write).toHaveBeenNthCalledWith(4, terminator);
        socketEmitter.emit("close");
        await expect(promise).resolves.toBe("");
    });

    it("should split the buffer into chunks of 64 KB", async () => {
        const { client, socket, socketEmitter } = makeSut();
        const buffer = Buffer.alloc(CHUNK_SIZE + 10, 1);
        const promise = client.scanBuffer(buffer);
        socketEmitter.emit("connect");
        const firstHeader = Buffer.alloc(4);
        firstHeader.writeUInt32BE(CHUNK_SIZE, 0);
        const secondHeader = Buffer.alloc(4);
        secondHeader.writeUInt32BE(10, 0);
        expect(socket.write).toHaveBeenNthCalledWith(2, firstHeader);
        expect(socket.write).toHaveBeenNthCalledWith(3, buffer.subarray(0, CHUNK_SIZE));
        expect(socket.write).toHaveBeenNthCalledWith(4, secondHeader);
        expect(socket.write).toHaveBeenNthCalledWith(5, buffer.subarray(CHUNK_SIZE));
        const terminator = Buffer.alloc(4);
        terminator.writeUInt32BE(0, 0);
        expect(socket.write).toHaveBeenNthCalledWith(6, terminator);
        socketEmitter.emit("close");
        await expect(promise).resolves.toBe("");
    });

    it("should resolve with the response received from the socket", async () => {
        const { client, socketEmitter } = makeSut();
        const promise = client.scanBuffer(Buffer.from("file-content"));
        socketEmitter.emit("connect");
        socketEmitter.emit("data", Buffer.from("stream: "));
        socketEmitter.emit("data", Buffer.from("OK"));
        socketEmitter.emit("close");
        await expect(promise).resolves.toBe("stream: OK");
    });

    it("should reject when the socket emits an error", async () => {
        const { client, socketEmitter } = makeSut();
        const promise = client.scanBuffer(Buffer.from("file-content"));
        const error = new Error("Connection refused");
        socketEmitter.emit("error", error);
        await expect(promise).rejects.toThrow("Connection refused");
    });

    it("should destroy the socket when the timeout is reached", async () => {
        const { client, socket, socketEmitter } = makeSut();
        const promise = client.scanBuffer(Buffer.from("file-content"));
        socketEmitter.emit("timeout");
        expect(socket.destroy).toHaveBeenCalledWith(new Error(`ClamAV scan timed out after ${TIMEOUT_MS}ms`));
        await expect(promise).rejects.toThrow(`ClamAV scan timed out after ${TIMEOUT_MS}ms`);
    });

    it("should send an empty buffer terminator when the buffer is empty", async () => {
        const { client, socket, socketEmitter } = makeSut();
        const promise = client.scanBuffer(Buffer.alloc(0));
        socketEmitter.emit("connect");
        expect(socket.write).toHaveBeenCalledTimes(2);
        expect(socket.write).toHaveBeenNthCalledWith(1, "zINSTREAM\0");
        const terminator = Buffer.alloc(4);
        terminator.writeUInt32BE(0, 0);
        expect(socket.write).toHaveBeenNthCalledWith(2, terminator);
        socketEmitter.emit("close");
        await expect(promise).resolves.toBe("");
    });

    it("should wait for drain when socket.write returns false", async () => {
        const { client, socket, socketEmitter } = makeSut();
        const buffer = Buffer.from("file-content");
        const writeMock = jest.mocked(socket.write);
        writeMock.mockReturnValueOnce(true).mockReturnValueOnce(false).mockReturnValueOnce(true);
        const promise = client.scanBuffer(buffer);
        socketEmitter.emit("connect");
        expect(writeMock).toHaveBeenCalledTimes(3);
        socketEmitter.emit("drain");
        expect(writeMock).toHaveBeenCalledTimes(4);
        socketEmitter.emit("close");
        await expect(promise).resolves.toBe("");
    });

    it("should ignore socket close after an error", async () => {
        const { client, socketEmitter } = makeSut();
        const promise = client.scanBuffer(Buffer.from("file-content"));
        socketEmitter.emit("error", new Error("Connection reset"));
        socketEmitter.emit("close");
        await expect(promise).rejects.toThrow("Connection reset");
    });

    it("should ignore socket errors when the connection is already finished", async () => {
        const { client, socketEmitter } = makeSut();
        const promise = client.scanBuffer(Buffer.from("file-content"));
        socketEmitter.emit("close");
        socketEmitter.emit("error", new Error("Connection refused"));
        await expect(promise).resolves.toBe("");
    });
});
