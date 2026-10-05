import type { File, FileQuota } from "../../domain/entities";
import { FileQuotaRepository, FileRepository, MagicBytesDetector } from "../../domain/interfaces";
import type { FilePurpose, FindManyFilesParams } from "../../domain/types";

export class FileRepositorySpy extends FileRepository {
    public create = jest.fn<Promise<void>, [File]>();
    public findById = jest.fn<Promise<File | null>, [string]>();
    public findByResource = jest.fn<Promise<File[]>, [string, string, string]>();
    public findByResourceAndPurpose = jest.fn<Promise<File | null>, [string, string, string, FilePurpose]>();
    public findMany = jest.fn<Promise<File[]>, [FindManyFilesParams]>();
    public update = jest.fn<Promise<void>, [File]>();
}

export class FileQuotaRepositorySpy extends FileQuotaRepository {
    public create = jest.fn<Promise<void>, [FileQuota]>();
    public findByTenantId = jest.fn<Promise<FileQuota | null>, [string]>();
    public update = jest.fn<Promise<void>, [FileQuota]>();
}

export class MagicBytesDetectorSpy extends MagicBytesDetector {
    public detect = jest.fn<Promise<string | null>, [Buffer]>();
}
