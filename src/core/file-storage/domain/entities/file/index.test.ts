import {
    EmptyFileNameError,
    FileAlreadyDeletedError,
    FileNotReadyError,
    InvalidFileExtensionError,
    InvalidFilePurposeError,
    InvalidFileResourceError,
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
        versions: [
            FileVersion.createInitial({
                storageKey: "files/document.pdf",
                size: 1024,
                checksum: "sha256:abc123",
                createdAt,
                name: "document",
                extension: "pdf",
                mimeType: "application/pdf",
            }),
        ],
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
    };
};

const createVersion = (version = 2, size = 2048) =>
    FileVersion.create({
        version,
        storageKey: `files/document-v${version}.pdf`,
        size,
        checksum: `sha256:version-${version}`,
        createdAt: new Date(),
        name: "document",
        extension: "pdf",
        mimeType: "application/pdf",
    });

describe("File", () => {
    it("should create and restore a file", () => {
        const created = File.create(createProps());
        const restored = File.restore(createProps());
        expect(created.status).toBe(FILE_STATUS.PENDING);
        expect(created.deletedAt).toBeNull();
        expect(restored.id).toBe("file-id");
        expect(restored.status).toBe(FILE_STATUS.PENDING);
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

    it("should return null when the latest version is unavailable", () => {
        const file = File.restore(createProps());
        const props = file as unknown as { props: FileProps };
        props.props.versions = [];
        expect(file.getLatestVersion()).toBeNull();
        props.props.versions = [undefined as never];
        expect(file.getLatestVersion()).toBeNull();
    });

    it("should identify whether the latest version is clean", () => {
        const props = createProps();
        const cleanScan = AntivirusScan.clean("ClamAV", props.createdAt);
        const cleanVersion = FileVersion.createInitial({
            storageKey: "files/document.pdf",
            size: 1024,
            checksum: "sha256:abc123",
            scans: [cleanScan],
            createdAt: props.createdAt,
            name: "document",
            extension: "pdf",
            mimeType: "application/pdf",
        });
        expect(File.restore({ ...props, versions: [cleanVersion] }).isClean()).toBe(true);
        expect(File.restore(props).isClean()).toBe(false);
    });

    it("should return the total size of all versions", () => {
        const props = createProps();
        const file = File.restore({ ...props, versions: [...props.versions, createVersion()] });
        expect(file.getTotalSize()).toBe(3072);
    });
});

describe("Validations", () => {
    it.each([
        ["name", "", EmptyFileNameError],
        ["name", "   ", EmptyFileNameError],
        ["extension", "", InvalidFileExtensionError],
        ["extension", "   ", InvalidFileExtensionError],
        ["mimeType", "", InvalidMimeTypeError],
        ["mimeType", "   ", InvalidMimeTypeError],
    ])("should reject invalid %s values", (field, value, ErrorClass) => {
        expect(() => File.create({ ...createProps(), [field]: value })).toThrow(ErrorClass);
    });

    it.each([0, -1, 1.5])("should reject invalid file size %s", (size) => {
        expect(() => File.create({ ...createProps(), size })).toThrow(InvalidFileSizeError);
    });

    it("should reject an invalid purpose", () => {
        expect(() => File.create({ ...createProps(), purpose: "INVALID" as never })).toThrow(InvalidFilePurposeError);
    });

    it("should require exactly one version when creating", () => {
        const props = createProps();
        const version = props.versions[0];
        expect(() => File.create({ ...props, versions: [] })).toThrow(InvalidFileVersionsError);
        expect(() => File.create({ ...props, versions: [version!, version!] })).toThrow(InvalidFileVersionsError);
    });

    it("should require at least one version when restoring", () => {
        expect(() => File.restore({ ...createProps(), versions: [] })).toThrow(InvalidFileVersionsError);
    });
});

describe("State transitions", () => {
    it("should mark a pending file as ready or infected", () => {
        const ready = File.create(createProps());
        const infected = File.create(createProps());
        ready.markReady();
        infected.markInfected();
        expect(ready.isReady()).toBe(true);
        expect(infected.isInfected()).toBe(true);
    });

    it("should reject invalid ready and infected transitions", () => {
        const ready = File.restore({ ...createProps(), status: FILE_STATUS.READY });
        const infected = File.restore({ ...createProps(), status: FILE_STATUS.INFECTED });
        expect(() => ready.markReady()).toThrow(InvalidFileStatusError);
        expect(() => infected.markInfected()).toThrow(InvalidFileStatusError);
    });

    it("should mark a ready file as infected by rescan", () => {
        const file = File.restore({ ...createProps(), status: FILE_STATUS.READY });
        const previousUpdatedAt = file.updatedAt;
        file.markAsInfectedByRescan();
        expect(file.status).toBe(FILE_STATUS.INFECTED);
        expect(file.isInfected()).toBe(true);
        expect(file.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
    });

    it.each([
        ["pending", FILE_STATUS.PENDING],
        ["infected", FILE_STATUS.INFECTED],
        ["deleted", FILE_STATUS.DELETED],
    ])("should reject rescan infection when the file is %s", (_, status) => {
        const file = File.restore({
            ...createProps(),
            status,
            deletedAt: status === FILE_STATUS.DELETED ? new Date() : null,
        });
        expect(() => file.markAsInfectedByRescan()).toThrow(InvalidFileStatusError);
    });

    it("should delete a ready file", () => {
        const file = File.restore({ ...createProps(), status: FILE_STATUS.READY });
        file.delete();
        expect(file.status).toBe(FILE_STATUS.DELETED);
        expect(file.deletedAt).toBeInstanceOf(Date);
        expect(file.isDeleted()).toBe(true);
    });

    it("should reject deleting non-ready or already deleted files", () => {
        const pending = File.create(createProps());
        const deleted = File.restore({ ...createProps(), status: FILE_STATUS.DELETED, deletedAt: new Date() });
        expect(() => pending.delete()).toThrow(FileNotReadyError);
        expect(() => deleted.delete()).toThrow(FileAlreadyDeletedError);
    });

    it("should mark a non-deleted file as orphan", () => {
        const file = File.restore({ ...createProps(), status: FILE_STATUS.READY });
        file.markAsOrphan();
        expect(file.status).toBe(FILE_STATUS.DELETED);
        expect(file.deletedAt).toBeInstanceOf(Date);
        expect(file.updatedAt).toBeInstanceOf(Date);
    });

    it("should not modify an already deleted file when marking it as orphan", () => {
        const deletedAt = new Date("2025-01-02T00:00:00.000Z");
        const updatedAt = new Date("2025-01-03T00:00:00.000Z");
        const file = File.restore({ ...createProps(), status: FILE_STATUS.DELETED, deletedAt, updatedAt });
        file.markAsOrphan();
        expect(file.deletedAt).toBe(deletedAt);
        expect(file.updatedAt).toBe(updatedAt);
    });
});

describe("Mutations", () => {
    it("should rename a file and reject an empty name", () => {
        const file = File.restore({ ...createProps(), status: FILE_STATUS.READY });
        file.rename("new-document");
        expect(file.name).toBe("new-document");
        expect(() => file.rename("   ")).toThrow(EmptyFileNameError);
    });

    it.each([
        ["pending", FILE_STATUS.PENDING],
        ["deleted", FILE_STATUS.DELETED],
    ])("should reject renaming a file when its status is %s", (_, status) => {
        const file = File.restore({
            ...createProps(),
            status,
            deletedAt: status === FILE_STATUS.DELETED ? new Date() : null,
        });
        expect(() => file.rename("new-document")).toThrow(FileNotReadyError);
    });

    it("should change the resource", () => {
        const file = File.restore({ ...createProps(), status: FILE_STATUS.READY });
        file.changeResource("TASK", "task-id");
        expect(file.resourceType).toBe("TASK");
        expect(file.resourceId).toBe("task-id");
    });

    it.each([
        ["", "task-id"],
        ["   ", "task-id"],
        ["TASK", ""],
        ["TASK", "   "],
    ])("should reject invalid resource values: resourceType=%s, resourceId=%s", (resourceType, resourceId) => {
        const file = File.restore({ ...createProps(), status: FILE_STATUS.READY });
        expect(() => file.changeResource(resourceType, resourceId)).toThrow(InvalidFileResourceError);
    });

    it.each([
        ["pending", FILE_STATUS.PENDING],
        ["deleted", FILE_STATUS.DELETED],
    ])("should reject changing the resource when the file is %s", (_, status) => {
        const file = File.restore({
            ...createProps(),
            status,
            deletedAt: status === FILE_STATUS.DELETED ? new Date() : null,
        });
        expect(() => file.changeResource("TASK", "task-id")).toThrow(FileNotReadyError);
    });

    it("should add the next version to a ready file", () => {
        const file = File.restore({ ...createProps(), status: FILE_STATUS.READY });
        const version = createVersion();
        file.addVersion(version);
        expect(file.versions).toHaveLength(2);
        expect(file.getLatestVersion()).toBe(version);
        expect(file.size).toBe(2048);
        expect(file.status).toBe(FILE_STATUS.PENDING);
    });

    it("should reject adding versions to non-ready files or with invalid sequence", () => {
        const pending = File.create(createProps());
        const ready = File.restore({ ...createProps(), status: FILE_STATUS.READY });
        expect(() => pending.addVersion(createVersion())).toThrow(FileNotReadyError);
        expect(() => ready.addVersion(createVersion(3))).toThrow(InvalidFileVersionsError);
    });

    it("should add a scan to the latest version", () => {
        const file = File.restore(createProps());
        const scan = AntivirusScan.clean("ClamAV", new Date("2025-01-02T00:00:00.000Z"));
        const previousUpdatedAt = file.updatedAt;
        file.addScanToLatestVersion(scan);
        expect(file.getLatestVersion()!.isClean()).toBe(true);
        expect(file.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
    });

    it("should reject adding a scan when there is no latest version", () => {
        const file = File.restore(createProps());
        const scan = AntivirusScan.clean("ClamAV", new Date("2025-01-02T00:00:00.000Z"));
        (file as unknown as { props: FileProps }).props.versions = [];
        expect(() => file.addScanToLatestVersion(scan)).toThrow(InvalidFileVersionsError);
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
