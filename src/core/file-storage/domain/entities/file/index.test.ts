import {
    EmptyFileNameError,
    FileAlreadyDeletedError,
    FileNotReadyError,
    InvalidFileExtensionError,
    InvalidFilePurposeError,
    InvalidFileSizeError,
    InvalidFileStatusError,
    InvalidFileVersionsError,
    InvalidMimeTypeError,
} from "../../errors";
import { FILE_PURPOSE, FILE_STATUS, type FileProps } from "../../types";
import { AntivirusScan, FileVersion } from "../../value-objects";
import { File } from "./index";

const createProps = (): FileProps => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    const version = FileVersion.createInitial({
        storageKey: "files/document.pdf",
        size: 1024,
        checksum: "sha256:abc123",
        createdAt,
        name: "document",
        extension: "pdf",
        mimeType: "application/pdf",
    });
    return {
        id: "file-id",
        tenantId: "tenant-id",
        ownerId: "owner-id",
        name: "document",
        extension: "pdf",
        mimeType: "application/pdf",
        size: 1024,
        purpose: FILE_PURPOSE.DOCUMENT,
        status: FILE_STATUS.PENDING,
        resourceType: "PROJECT",
        resourceId: "project-id",
        versions: [version],
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
    };
};

describe("File", () => {
    it("should create a file", () => {
        const file = File.create(createProps());
        expect(file.id).toBe("file-id");
        expect(file.status).toBe(FILE_STATUS.PENDING);
        expect(file.deletedAt).toBeNull();
    });

    it("should restore a file", () => {
        const file = File.restore(createProps());
        expect(file.id).toBe("file-id");
        expect(file.status).toBe(FILE_STATUS.PENDING);
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const file = File.restore(props);
        expect(file.id).toBe(props.id);
        expect(file.tenantId).toBe(props.tenantId);
        expect(file.ownerId).toBe(props.ownerId);
        expect(file.name).toBe(props.name);
        expect(file.extension).toBe(props.extension);
        expect(file.mimeType).toBe(props.mimeType);
        expect(file.size).toBe(props.size);
        expect(file.purpose).toBe(props.purpose);
        expect(file.status).toBe(props.status);
        expect(file.resourceType).toBe(props.resourceType);
        expect(file.resourceId).toBe(props.resourceId);
        expect(file.versions).toBe(props.versions);
        expect(file.createdAt).toBe(props.createdAt);
        expect(file.updatedAt).toBe(props.updatedAt);
        expect(file.deletedAt).toBeNull();
    });

    it("should return the latest version", () => {
        const file = File.restore(createProps());
        expect(file.getLatestVersion()).toBe(file.versions[0]);
    });

    it("should return true when the latest version is clean", () => {
        const props = createProps();
        const scan = AntivirusScan.clean("ClamAV", props.createdAt);
        const version = FileVersion.createInitial({
            storageKey: "files/document.pdf",
            size: 1024,
            checksum: "sha256:abc123",
            scans: [scan],
            createdAt: props.createdAt,
            name: "document",
            extension: "pdf",
            mimeType: "application/pdf",
        });
        const file = File.restore({ ...props, versions: [version] });
        expect(file.isClean()).toBe(true);
    });

    it("should return false when the latest version is not clean", () => {
        const file = File.restore(createProps());
        expect(file.isClean()).toBe(false);
    });

    it("should return null when versions length is zero", () => {
        const file = File.restore(createProps());
        (file as unknown as { props: FileProps }).props.versions = [];
        expect(file.getLatestVersion()).toBeNull();
    });

    it("should return null when the latest version is undefined", () => {
        const file = File.restore(createProps());
        (file as unknown as { props: FileProps }).props.versions = [undefined as never];
        expect(file.getLatestVersion()).toBeNull();
    });
});

describe("Validations", () => {
    it.each([
        ["empty string", ""],
        ["whitespace string", "   "],
    ])("should throw EmptyFileNameError when name is %s", (_, name) => {
        expect(() => File.create({ ...createProps(), name })).toThrow(EmptyFileNameError);
    });

    it.each([
        ["empty string", ""],
        ["whitespace string", "   "],
    ])("should throw InvalidFileExtensionError when extension is %s", (_, extension) => {
        expect(() => File.create({ ...createProps(), extension })).toThrow(InvalidFileExtensionError);
    });

    it.each([
        ["empty string", ""],
        ["whitespace string", "   "],
    ])("should throw InvalidMimeTypeError when mime type is %s", (_, mimeType) => {
        expect(() => File.create({ ...createProps(), mimeType })).toThrow(InvalidMimeTypeError);
    });

    it.each([0, -1, 1.5])("should throw InvalidFileSizeError when size is %s", (size) => {
        expect(() => File.create({ ...createProps(), size })).toThrow(InvalidFileSizeError);
    });

    it("should throw InvalidFilePurposeError for an invalid purpose", () => {
        expect(() => File.create({ ...createProps(), purpose: "INVALID" as never })).toThrow(InvalidFilePurposeError);
    });

    it("should throw InvalidFileVersionsError when creating without exactly one version", () => {
        const props = createProps();
        const version = props.versions[0];
        expect(() => File.create({ ...props, versions: [] })).toThrow(InvalidFileVersionsError);
        expect(() => File.create({ ...props, versions: [version!, version!] })).toThrow(InvalidFileVersionsError);
    });

    it("should throw InvalidFileVersionsError when restoring without versions", () => {
        expect(() => File.restore({ ...createProps(), versions: [] })).toThrow(InvalidFileVersionsError);
    });
});

describe("State transitions", () => {
    it("should mark a pending file as ready", () => {
        const file = File.create(createProps());
        file.markReady();
        expect(file.status).toBe(FILE_STATUS.READY);
        expect(file.isReady()).toBe(true);
    });

    it("should mark a pending file as infected", () => {
        const file = File.create(createProps());
        file.markInfected();
        expect(file.status).toBe(FILE_STATUS.INFECTED);
        expect(file.isInfected()).toBe(true);
    });

    it("should not mark a non-pending file as ready or infected", () => {
        const ready = File.restore({ ...createProps(), status: FILE_STATUS.READY });
        const infected = File.restore({ ...createProps(), status: FILE_STATUS.INFECTED });
        expect(() => ready.markReady()).toThrow(InvalidFileStatusError);
        expect(() => infected.markInfected()).toThrow(InvalidFileStatusError);
    });

    it("should delete a ready file", () => {
        const file = File.restore({ ...createProps(), status: FILE_STATUS.READY });
        file.delete();
        expect(file.status).toBe(FILE_STATUS.DELETED);
        expect(file.deletedAt).toBeInstanceOf(Date);
        expect(file.isDeleted()).toBe(true);
    });

    it("should not delete a non-ready file", () => {
        const file = File.create(createProps());
        expect(() => file.delete()).toThrow(FileNotReadyError);
    });

    it("should not delete an already deleted file", () => {
        const file = File.restore({ ...createProps(), status: FILE_STATUS.DELETED, deletedAt: new Date() });
        expect(() => file.delete()).toThrow(FileAlreadyDeletedError);
    });
});

describe("Mutations", () => {
    it("should rename the file", () => {
        const file = File.create(createProps());
        file.rename("new-document");
        expect(file.name).toBe("new-document");
    });

    it("should throw when renaming with an empty name", () => {
        const file = File.create(createProps());
        expect(() => file.rename("   ")).toThrow(EmptyFileNameError);
    });

    it("should change the resource", () => {
        const file = File.create(createProps());
        file.changeResource("TASK", "task-id");
        expect(file.resourceType).toBe("TASK");
        expect(file.resourceId).toBe("task-id");
    });

    it("should add the next version to a ready file", () => {
        const file = File.restore({ ...createProps(), status: FILE_STATUS.READY });
        const version = FileVersion.create({
            version: 2,
            storageKey: "files/document-v2.pdf",
            size: 2048,
            checksum: "sha256:def456",
            createdAt: new Date(),
            name: "document",
            extension: "pdf",
            mimeType: "application/pdf",
        });
        file.addVersion(version);
        expect(file.versions).toHaveLength(2);
        expect(file.getLatestVersion()).toBe(version);
        expect(file.size).toBe(2048);
    });

    it("should not add a version to a non-ready file", () => {
        const file = File.create(createProps());
        const version = createProps().versions[0];
        expect(version).toBeDefined();
        expect(() => file.addVersion(version!)).toThrow(FileNotReadyError);
    });

    it("should throw when adding a non-sequential version", () => {
        const file = File.restore({ ...createProps(), status: FILE_STATUS.READY });
        const version = FileVersion.create({
            version: 3,
            storageKey: "files/document-v3.pdf",
            size: 2048,
            checksum: "sha256:def456",
            createdAt: new Date(),
            name: "document",
            extension: "pdf",
            mimeType: "application/pdf",
        });
        expect(() => file.addVersion(version)).toThrow(InvalidFileVersionsError);
    });

    it("should return the total size of all versions", () => {
        const props = createProps();
        const version2 = FileVersion.create({
            version: 2,
            storageKey: "files/document-v2.pdf",
            size: 2048,
            checksum: "sha256:def456",
            createdAt: new Date(),
            name: "document",
            extension: "pdf",
            mimeType: "application/pdf",
        });
        const file = File.restore({
            ...props,
            versions: [...props.versions, version2],
        });
        expect(file.getTotalSize()).toBe(3072);
    });
});

describe("Status helpers", () => {
    it("should identify pending, ready, infected and deleted files", () => {
        expect(File.restore({ ...createProps(), status: FILE_STATUS.PENDING }).isPending()).toBe(true);
        expect(File.restore({ ...createProps(), status: FILE_STATUS.READY }).isReady()).toBe(true);
        expect(File.restore({ ...createProps(), status: FILE_STATUS.INFECTED }).isInfected()).toBe(true);
        expect(File.restore({ ...createProps(), status: FILE_STATUS.DELETED, deletedAt: new Date() }).isDeleted()).toBe(
            true,
        );
    });
});
