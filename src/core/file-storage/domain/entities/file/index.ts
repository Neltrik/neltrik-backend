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
import { FILE_PURPOSE, FILE_STATUS, type FileProps, type FilePurpose, type FileStatus } from "../../types";
import { type FileVersion } from "../../value-objects";

export class File {
    private props: FileProps;

    private constructor(props: FileProps) {
        this.ensureNameIsNotEmpty(props.name);
        this.ensureExtensionIsNotEmpty(props.extension);
        this.ensureMimeTypeIsNotEmpty(props.mimeType);
        this.ensureSizeIsValid(props.size);
        this.ensurePurposeIsValid(props.purpose);
        this.ensureVersionsIsNotEmpty(props.versions);
        this.props = props;
    }

    public static create(props: Omit<FileProps, "status" | "updatedAt" | "deletedAt">): File {
        if (!Array.isArray(props.versions) || props.versions.length !== 1) {
            throw new InvalidFileVersionsError();
        }
        return new File({ ...props, status: FILE_STATUS.PENDING, updatedAt: props.createdAt, deletedAt: null });
    }

    public static restore(props: FileProps): File {
        return new File(props);
    }

    private ensureNameIsNotEmpty(name: string): void {
        if (!name || name.trim() === "") {
            throw new EmptyFileNameError();
        }
    }

    private ensureExtensionIsNotEmpty(extension: string): void {
        if (!extension || extension.trim() === "") {
            throw new InvalidFileExtensionError();
        }
    }

    private ensureMimeTypeIsNotEmpty(mimeType: string): void {
        if (!mimeType || mimeType.trim() === "") {
            throw new InvalidMimeTypeError();
        }
    }

    private ensureSizeIsValid(size: number): void {
        if (!Number.isInteger(size) || size <= 0) {
            throw new InvalidFileSizeError();
        }
    }

    private ensurePurposeIsValid(purpose: FilePurpose): void {
        const valid = Object.values(FILE_PURPOSE).includes(purpose);
        if (!valid) {
            throw new InvalidFilePurposeError();
        }
    }

    private ensureVersionsIsNotEmpty(versions: FileVersion[]): void {
        if (!Array.isArray(versions) || versions.length === 0) {
            throw new InvalidFileVersionsError();
        }
    }

    public markReady(): void {
        if (this.props.status !== FILE_STATUS.PENDING) {
            throw new InvalidFileStatusError();
        }
        this.props.status = FILE_STATUS.READY;
        this.props.updatedAt = new Date();
    }

    public markInfected(): void {
        if (this.props.status !== FILE_STATUS.PENDING) {
            throw new InvalidFileStatusError();
        }
        this.props.status = FILE_STATUS.INFECTED;
        this.props.updatedAt = new Date();
    }

    public delete(): void {
        if (this.props.deletedAt !== null) {
            throw new FileAlreadyDeletedError();
        }
        if (this.props.status !== FILE_STATUS.READY && this.props.status !== FILE_STATUS.INFECTED) {
            throw new FileNotReadyError();
        }
        this.props.status = FILE_STATUS.DELETED;
        this.props.deletedAt = new Date();
        this.props.updatedAt = new Date();
    }

    public addVersion(version: FileVersion): void {
        if (this.props.status !== FILE_STATUS.READY) {
            throw new FileNotReadyError();
        }
        const latest = this.getLatestVersion();
        if (latest === null || version.getVersion() !== latest.getVersion() + 1) {
            throw new InvalidFileVersionsError();
        }
        this.props.versions.push(version);
        this.props.size = version.getSize();
        this.props.updatedAt = new Date();
    }

    public rename(newName: string): void {
        this.ensureNameIsNotEmpty(newName);
        this.props.name = newName;
        this.props.updatedAt = new Date();
    }

    public changeResource(resourceType: string, resourceId: string): void {
        this.props.resourceType = resourceType;
        this.props.resourceId = resourceId;
        this.props.updatedAt = new Date();
    }

    public getTotalSize(): number {
        return this.props.versions.reduce((sum, version) => sum + version.getSize(), 0);
    }

    public get id(): string {
        return this.props.id;
    }

    public get tenantId(): string {
        return this.props.tenantId;
    }

    public get ownerId(): string {
        return this.props.ownerId;
    }

    public get name(): string {
        return this.props.name;
    }

    public get extension(): string {
        return this.props.extension;
    }

    public get mimeType(): string {
        return this.props.mimeType;
    }

    public get size(): number {
        return this.props.size;
    }

    public get purpose(): FilePurpose {
        return this.props.purpose;
    }

    public get status(): FileStatus {
        return this.props.status;
    }

    public get resourceType(): string {
        return this.props.resourceType;
    }

    public get resourceId(): string {
        return this.props.resourceId;
    }

    public get versions(): ReadonlyArray<FileVersion> {
        return this.props.versions;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }

    public get deletedAt(): Date | null {
        return this.props.deletedAt;
    }

    public isReady(): boolean {
        return this.props.status === FILE_STATUS.READY;
    }

    public isDeleted(): boolean {
        return this.props.status === FILE_STATUS.DELETED;
    }

    public isInfected(): boolean {
        return this.props.status === FILE_STATUS.INFECTED;
    }

    public isPending(): boolean {
        return this.props.status === FILE_STATUS.PENDING;
    }

    public getLatestVersion(): FileVersion | null {
        if (this.props.versions.length === 0) {
            return null;
        }
        const latest = this.props.versions[this.props.versions.length - 1];
        return latest ?? null;
    }

    public isClean(): boolean {
        const latest = this.getLatestVersion();
        return latest !== null && latest.isClean();
    }
}
