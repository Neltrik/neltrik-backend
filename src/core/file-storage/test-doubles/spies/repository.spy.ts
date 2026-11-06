import { type TransactionContext } from "@/shared/transaction";

import type { File, FileQuota } from "../../domain/entities";
import { FileQuotaRepository, FileRepository, MagicBytesDetector } from "../../domain/interfaces";
import type { FilePurpose, FindManyFilesParams } from "../../domain/types";

export class FileRepositorySpy extends FileRepository {
    public create = jest.fn<Promise<void>, [File]>();
    public update = jest.fn<Promise<void>, [File]>();
    public findById = jest.fn<Promise<File | null>, [string]>();
    public findByResource = jest.fn<Promise<File[]>, [string, string, string]>();
    public findByResourceAndPurpose = jest.fn<Promise<File | null>, [string, string, string, FilePurpose]>();
    public findMany = jest.fn<Promise<File[]>, [FindManyFilesParams]>();
    public findAllByTenant = jest.fn<Promise<File[]>, [string]>();
    public findDeletedBefore = jest.fn<Promise<File[]>, [string, Date]>();
    public findReadyForRescan = jest.fn<Promise<File[]>, [string, Date]>();
}

export class FileQuotaRepositorySpy extends FileQuotaRepository {
    public create = jest.fn<Promise<FileQuota>, [FileQuota]>();
    public findByTenantId = jest.fn<Promise<FileQuota | null>, [string]>();
    public update = jest.fn<Promise<void>, [FileQuota]>();
    public incrementUsedBytes = jest.fn<Promise<void>, [string, number, TransactionContext]>();
    public decrementUsedBytes = jest.fn<Promise<void>, [string, number, TransactionContext]>();
}

export class MagicBytesDetectorSpy extends MagicBytesDetector {
    public detect = jest.fn<Promise<string | null>, [Buffer]>();
}
