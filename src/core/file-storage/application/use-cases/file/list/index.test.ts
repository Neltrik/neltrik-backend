import { File } from "../../../../domain/entities";
import { FileVersion } from "../../../../domain/value-objects";
import { FileRepositorySpy } from "../../../../test-doubles";
import { ListFilesUseCase } from "./index";
import type { ListFilesInput } from "./input";

const makeFile = (id: string): File => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    const version = FileVersion.createInitial({
        storageKey: `files/${id}/v1`,
        size: 1024,
        checksum: `checksum-${id}`,
        createdAt,
        name: `document-${id}`,
        extension: "pdf",
        mimeType: "application/pdf",
    });
    return File.create({
        id,
        tenantId: "tenant-id",
        ownerId: "owner-id",
        name: `document-${id}`,
        extension: "pdf",
        mimeType: "application/pdf",
        size: 1024,
        purpose: "DOCUMENT",
        resourceType: "USER",
        resourceId: "resource-id",
        versions: [version],
        createdAt,
    });
};

const makeInput = (): ListFilesInput => ({
    tenantId: "tenant-id",
    ownerId: "owner-id",
    resourceType: "USER",
    resourceId: "resource-id",
    purpose: "DOCUMENT",
    status: "PENDING",
    cursor: undefined,
    limit: 20,
});

describe("ListFilesUseCase", () => {
    const makeSut = () => {
        const fileRepository = new FileRepositorySpy();
        const useCase = new ListFilesUseCase(fileRepository);
        return { useCase, fileRepository };
    };

    it("should list files successfully", async () => {
        const { useCase, fileRepository } = makeSut();
        const files = [makeFile("file-id-1"), makeFile("file-id-2")];
        fileRepository.findMany.mockResolvedValue(files);
        const result = await useCase.execute(makeInput());
        expect(fileRepository.findMany).toHaveBeenCalledTimes(1);
        expect(fileRepository.findMany).toHaveBeenCalledWith({
            tenantId: "tenant-id",
            ownerId: "owner-id",
            resourceType: "USER",
            resourceId: "resource-id",
            purpose: "DOCUMENT",
            status: "PENDING",
            cursor: undefined,
            limit: 20,
        });
        expect(result.files).toEqual(files);
        expect(result.meta).toBeDefined();
    });

    it("should return an empty list when no files exist", async () => {
        const { useCase, fileRepository } = makeSut();
        fileRepository.findMany.mockResolvedValue([]);
        const result = await useCase.execute(makeInput());
        expect(fileRepository.findMany).toHaveBeenCalledTimes(1);
        expect(result.files).toEqual([]);
        expect(result.meta).toBeDefined();
    });

    it("should pass all filters to the file repository", async () => {
        const { useCase, fileRepository } = makeSut();
        const input: ListFilesInput = {
            tenantId: "tenant-id",
            ownerId: "owner-id",
            resourceType: "PROJECT",
            resourceId: "project-id",
            purpose: "DOCUMENT",
            status: "READY",
            cursor: "cursor-id",
            limit: 10,
        };
        fileRepository.findMany.mockResolvedValue([]);
        await useCase.execute(input);
        expect(fileRepository.findMany).toHaveBeenCalledTimes(1);
        expect(fileRepository.findMany).toHaveBeenCalledWith({
            tenantId: "tenant-id",
            ownerId: "owner-id",
            resourceType: "PROJECT",
            resourceId: "project-id",
            purpose: "DOCUMENT",
            status: "READY",
            cursor: "cursor-id",
            limit: 10,
        });
    });

    it("should paginate files using the requested limit", async () => {
        const { useCase, fileRepository } = makeSut();
        const files = [makeFile("file-id-1"), makeFile("file-id-2"), makeFile("file-id-3")];
        fileRepository.findMany.mockResolvedValue(files);
        const result = await useCase.execute({ ...makeInput(), limit: 2 });
        expect(result.files).toHaveLength(2);
        expect(result.files).toEqual([files[0], files[1]]);
    });

    it("should use file id for pagination", async () => {
        const { useCase, fileRepository } = makeSut();
        const files = [makeFile("file-id-1"), makeFile("file-id-2")];
        fileRepository.findMany.mockResolvedValue(files);
        const result = await useCase.execute(makeInput());
        expect(result.files).toEqual(files);
        expect(result.files.map((file) => file.id)).toEqual(["file-id-1", "file-id-2"]);
    });

    it("should propagate repository errors", async () => {
        const { useCase, fileRepository } = makeSut();
        fileRepository.findMany.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileRepository.findMany).toHaveBeenCalledTimes(1);
        expect(fileRepository.findMany).toHaveBeenCalledWith({
            tenantId: "tenant-id",
            ownerId: "owner-id",
            resourceType: "USER",
            resourceId: "resource-id",
            purpose: "DOCUMENT",
            status: "PENDING",
            cursor: undefined,
            limit: 20,
        });
    });
});
