import type { File } from "../../entities";
import type { FilePurpose, FindManyFilesParams } from "../../types";

export abstract class FileRepository {
    abstract create(file: File): Promise<void>;
    abstract findById(id: string): Promise<File | null>;
    abstract findByResource(tenantId: string, resourceType: string, resourceId: string): Promise<File[]>;
    abstract findByResourceAndPurpose(
        tenantId: string,
        resourceType: string,
        resourceId: string,
        purpose: FilePurpose,
    ): Promise<File | null>;
    abstract findMany(params: FindManyFilesParams): Promise<File[]>;
    abstract update(file: File): Promise<void>;
}
