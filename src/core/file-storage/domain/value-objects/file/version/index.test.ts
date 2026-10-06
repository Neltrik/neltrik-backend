import { InvalidFileVersionError } from "../../../errors";
import { AntivirusScan } from "../antivirus-scan";
import { FileVersion } from "./index";

describe("FileVersion", () => {
    const createdAt = new Date("2026-01-15T10:30:00.000Z");
    const scan = AntivirusScan.clean("ClamAV", createdAt);
    const validParams = {
        version: 1,
        name: "document",
        extension: "pdf",
        mimeType: "application/pdf",
        storageKey: "files/document.pdf",
        size: 1024,
        checksum: "sha256:abc123",
        createdAt,
    };

    it("should create an initial file version with scans", () => {
        const fileVersion = FileVersion.createInitial({ ...validParams, scans: [scan] });
        expect(fileVersion.getVersion()).toBe(1);
        expect(fileVersion.getName()).toBe("document");
        expect(fileVersion.getExtension()).toBe("pdf");
        expect(fileVersion.getMimeType()).toBe("application/pdf");
        expect(fileVersion.getScans()).toEqual([scan]);
    });

    it("should return null when the latest scan is undefined", () => {
        const fileVersion = FileVersion.create({ ...validParams, scans: [undefined as never] });
        expect(fileVersion.getLatestScan()).toBeNull();
    });

    it("should create a valid file version", () => {
        const fileVersion = FileVersion.create(validParams);
        expect(fileVersion.getVersion()).toBe(1);
        expect(fileVersion.getName()).toBe("document");
        expect(fileVersion.getExtension()).toBe("pdf");
        expect(fileVersion.getMimeType()).toBe("application/pdf");
        expect(fileVersion.getStorageKey()).toBe("files/document.pdf");
        expect(fileVersion.getSize()).toBe(1024);
        expect(fileVersion.getChecksum()).toBe("sha256:abc123");
        expect(fileVersion.getScans()).toEqual([]);
        expect(fileVersion.getCreatedAt()).toEqual(createdAt);
    });

    it("should create an initial file version with version 1", () => {
        const fileVersion = FileVersion.createInitial(validParams);
        expect(fileVersion.getVersion()).toBe(1);
        expect(fileVersion.getStorageKey()).toBe(validParams.storageKey);
    });

    it("should create a file version with scans", () => {
        const fileVersion = FileVersion.create({ ...validParams, scans: [scan] });
        expect(fileVersion.getScans()).toEqual([scan]);
        expect(fileVersion.getLatestScan()).toBe(scan);
    });

    it("should throw InvalidFileVersionError for invalid version", () => {
        expect(() => FileVersion.create({ ...validParams, version: 0 })).toThrow(InvalidFileVersionError);
        expect(() => FileVersion.create({ ...validParams, version: -1 })).toThrow(InvalidFileVersionError);
        expect(() => FileVersion.create({ ...validParams, version: 1.5 })).toThrow(InvalidFileVersionError);
    });

    it.each([
        ["", "empty string"],
        ["   ", "whitespace string"],
    ])("should throw InvalidFileVersionError for invalid name: %s", (name) => {
        expect(() => FileVersion.create({ ...validParams, name })).toThrow(InvalidFileVersionError);
    });

    it.each([
        ["", "empty string"],
        ["   ", "whitespace string"],
    ])("should throw InvalidFileVersionError for invalid extension: %s", (extension) => {
        expect(() => FileVersion.create({ ...validParams, extension })).toThrow(InvalidFileVersionError);
    });

    it.each([
        ["", "empty string"],
        ["   ", "whitespace string"],
    ])("should throw InvalidFileVersionError for invalid mime type: %s", (mimeType) => {
        expect(() => FileVersion.create({ ...validParams, mimeType })).toThrow(InvalidFileVersionError);
    });

    it("should throw InvalidFileVersionError for invalid storage key", () => {
        expect(() => FileVersion.create({ ...validParams, storageKey: "" })).toThrow(InvalidFileVersionError);
        expect(() => FileVersion.create({ ...validParams, storageKey: "   " })).toThrow(InvalidFileVersionError);
    });

    it("should throw InvalidFileVersionError for invalid size", () => {
        expect(() => FileVersion.create({ ...validParams, size: 0 })).toThrow(InvalidFileVersionError);
        expect(() => FileVersion.create({ ...validParams, size: -1 })).toThrow(InvalidFileVersionError);
        expect(() => FileVersion.create({ ...validParams, size: 1.5 })).toThrow(InvalidFileVersionError);
    });

    it("should throw InvalidFileVersionError for invalid checksum", () => {
        expect(() => FileVersion.create({ ...validParams, checksum: "" })).toThrow(InvalidFileVersionError);
        expect(() => FileVersion.create({ ...validParams, checksum: "   " })).toThrow(InvalidFileVersionError);
    });

    it("should throw InvalidFileVersionError for invalid createdAt", () => {
        expect(() => FileVersion.create({ ...validParams, createdAt: new Date("invalid") })).toThrow(
            InvalidFileVersionError,
        );
    });

    it("should return null as latest scan when there are no scans", () => {
        const fileVersion = FileVersion.create(validParams);
        expect(fileVersion.getLatestScan()).toBeNull();
        expect(fileVersion.isClean()).toBe(false);
    });

    it("should return true when the latest scan is clean", () => {
        const fileVersion = FileVersion.create({
            ...validParams,
            scans: [AntivirusScan.infected("ClamAV", "Malware", createdAt), scan],
        });
        expect(fileVersion.isClean()).toBe(true);
    });

    it("should return false when the latest scan is not clean", () => {
        const infectedScan = AntivirusScan.infected("ClamAV", "Malware", createdAt);
        const fileVersion = FileVersion.create({ ...validParams, scans: [infectedScan] });
        expect(fileVersion.isClean()).toBe(false);
        expect(fileVersion.getLatestScan()).toBe(infectedScan);
    });

    it("should append a scan without mutating the original version", () => {
        const fileVersion = FileVersion.create(validParams);
        const updatedVersion = fileVersion.withScan(scan);
        expect(fileVersion.getScans()).toEqual([]);
        expect(updatedVersion.getScans()).toEqual([scan]);
        expect(updatedVersion.getVersion()).toBe(fileVersion.getVersion());
    });

    it("should protect the createdAt date from external mutation", () => {
        const fileVersion = FileVersion.create(validParams);
        const date = fileVersion.getCreatedAt();
        date.setFullYear(2030);
        expect(fileVersion.getCreatedAt()).toEqual(createdAt);
    });

    it("should keep scans immutable", () => {
        const scans = [scan];
        const fileVersion = FileVersion.create({ ...validParams, scans });
        scans.push(AntivirusScan.infected("ClamAV", "Malware", createdAt));
        expect(fileVersion.getScans()).toEqual([scan]);
        expect(Object.isFrozen(fileVersion.getScans())).toBe(true);
    });

    it("should return true when two file versions are equal", () => {
        const first = FileVersion.create({ ...validParams, scans: [scan] });
        const second = FileVersion.create({
            ...validParams,
            scans: [AntivirusScan.clean("ClamAV", new Date(createdAt.getTime()))],
        });
        expect(first.equals(second)).toBe(true);
    });

    it("should return false when file versions have different properties", () => {
        const first = FileVersion.create(validParams);
        expect(first.equals(FileVersion.create({ ...validParams, version: 2 }))).toBe(false);
        expect(first.equals(FileVersion.create({ ...validParams, name: "other-document" }))).toBe(false);
        expect(first.equals(FileVersion.create({ ...validParams, extension: "txt" }))).toBe(false);

        expect(first.equals(FileVersion.create({ ...validParams, mimeType: "text/plain" }))).toBe(false);
        expect(first.equals(FileVersion.create({ ...validParams, size: 2048 }))).toBe(false);
        expect(first.equals(FileVersion.create({ ...validParams, checksum: "different" }))).toBe(false);
        expect(
            first.equals(FileVersion.create({ ...validParams, createdAt: new Date("2026-01-16T10:30:00.000Z") })),
        ).toBe(false);
    });

    it("should return false when file versions have different scans", () => {
        const first = FileVersion.create({ ...validParams, scans: [scan] });
        const second = FileVersion.create({
            ...validParams,
            scans: [AntivirusScan.infected("ClamAV", "Malware", createdAt)],
        });
        expect(first.equals(second)).toBe(false);
    });
});
