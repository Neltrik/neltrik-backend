import { InvalidFileVersionError } from "../../../errors";
import type { AntivirusScan } from "../antivirus-scan";

export class FileVersion {
    private constructor(
        private readonly version: number,
        private readonly name: string,
        private readonly extension: string,
        private readonly mimeType: string,
        private readonly storageKey: string,
        private readonly size: number,
        private readonly checksum: string,
        private readonly scans: ReadonlyArray<AntivirusScan>,
        private readonly createdAt: Date,
    ) {}

    public static create(params: {
        version: number;
        name: string;
        extension: string;
        mimeType: string;
        storageKey: string;
        size: number;
        checksum: string;
        scans?: ReadonlyArray<AntivirusScan>;
        createdAt: Date;
    }): FileVersion {
        FileVersion.ensureVersion(params.version);
        FileVersion.ensureName(params.name);
        FileVersion.ensureExtension(params.extension);
        FileVersion.ensureMimeType(params.mimeType);
        FileVersion.ensureStorageKey(params.storageKey);
        FileVersion.ensureSize(params.size);
        FileVersion.ensureChecksum(params.checksum);
        FileVersion.ensureCreatedAt(params.createdAt);
        return new FileVersion(
            params.version,
            params.name,
            params.extension,
            params.mimeType,
            params.storageKey,
            params.size,
            params.checksum,
            Object.freeze([...(params.scans ?? [])]),
            new Date(params.createdAt.getTime()),
        );
    }

    public static createInitial(params: {
        name: string;
        extension: string;
        mimeType: string;
        storageKey: string;
        size: number;
        checksum: string;
        scans?: ReadonlyArray<AntivirusScan>;
        createdAt: Date;
    }): FileVersion {
        return FileVersion.create({
            version: 1,
            name: params.name,
            extension: params.extension,
            mimeType: params.mimeType,
            storageKey: params.storageKey,
            size: params.size,
            checksum: params.checksum,
            ...(params.scans !== undefined ? { scans: params.scans } : {}),
            createdAt: params.createdAt,
        });
    }

    private static ensureVersion(version: number): void {
        if (!Number.isInteger(version) || version < 1) {
            throw new InvalidFileVersionError();
        }
    }

    private static ensureName(name: string): void {
        if (typeof name !== "string" || name.trim().length === 0) {
            throw new InvalidFileVersionError();
        }
    }

    private static ensureExtension(extension: string): void {
        if (typeof extension !== "string" || extension.trim().length === 0) {
            throw new InvalidFileVersionError();
        }
    }

    private static ensureMimeType(mimeType: string): void {
        if (typeof mimeType !== "string" || mimeType.trim().length === 0) {
            throw new InvalidFileVersionError();
        }
    }

    private static ensureStorageKey(storageKey: string): void {
        if (typeof storageKey !== "string" || storageKey.trim().length === 0) {
            throw new InvalidFileVersionError();
        }
    }

    private static ensureSize(size: number): void {
        if (!Number.isInteger(size) || size <= 0) {
            throw new InvalidFileVersionError();
        }
    }

    private static ensureChecksum(checksum: string): void {
        if (typeof checksum !== "string" || checksum.trim().length === 0) {
            throw new InvalidFileVersionError();
        }
    }

    private static ensureCreatedAt(createdAt: Date): void {
        if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
            throw new InvalidFileVersionError();
        }
    }

    public getVersion(): number {
        return this.version;
    }

    public getName(): string {
        return this.name;
    }

    public getExtension(): string {
        return this.extension;
    }

    public getMimeType(): string {
        return this.mimeType;
    }

    public getStorageKey(): string {
        return this.storageKey;
    }

    public getSize(): number {
        return this.size;
    }

    public getChecksum(): string {
        return this.checksum;
    }

    public getScans(): ReadonlyArray<AntivirusScan> {
        return this.scans;
    }

    public getCreatedAt(): Date {
        return new Date(this.createdAt.getTime());
    }

    public getLatestScan(): AntivirusScan | null {
        if (this.scans.length === 0) {
            return null;
        }
        const latest = this.scans[this.scans.length - 1];
        return latest ?? null;
    }

    public isClean(): boolean {
        const latest = this.getLatestScan();
        return latest !== null && latest.isClean();
    }

    public withScan(scan: AntivirusScan): FileVersion {
        return new FileVersion(
            this.version,
            this.name,
            this.extension,
            this.mimeType,
            this.storageKey,
            this.size,
            this.checksum,
            Object.freeze([...this.scans, scan]),
            new Date(this.createdAt.getTime()),
        );
    }

    public equals(other: FileVersion): boolean {
        if (
            this.version !== other.version ||
            this.name !== other.name ||
            this.extension !== other.extension ||
            this.mimeType !== other.mimeType ||
            this.storageKey !== other.storageKey ||
            this.size !== other.size ||
            this.checksum !== other.checksum ||
            this.createdAt.getTime() !== other.createdAt.getTime() ||
            this.scans.length !== other.scans.length
        ) {
            return false;
        }
        return this.scans.every((scan, index) => {
            const otherScan = other.scans[index];
            return otherScan !== undefined && scan.equals(otherScan);
        });
    }
}
