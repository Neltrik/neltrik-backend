import type { File } from "../../domain/entities";
import { FileRepository } from "../../domain/interfaces";
import type { FilePurpose, FindManyFilesParams } from "../../domain/types";

export class FileRepositorySpy extends FileRepository {
    public create = jest.fn<Promise<void>, [File]>();
    public findById = jest.fn<Promise<File | null>, [string]>();
    public findByResource = jest.fn<Promise<File[]>, [string, string, string]>();
    public findByResourceAndPurpose = jest.fn<Promise<File | null>, [string, string, string, FilePurpose]>();
    public findMany = jest.fn<Promise<File[]>, [FindManyFilesParams]>();
    public update = jest.fn<Promise<void>, [File]>();
}
