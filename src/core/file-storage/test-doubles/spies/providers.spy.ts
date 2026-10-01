import { FileStoragePort } from "../../domain/interfaces";

export class FileStoragePortSpy extends FileStoragePort {
    public override upload = jest.fn<Promise<void>, [string, Buffer, string]>();
    public override download = jest.fn<Promise<Buffer>, [string]>();
    public override delete = jest.fn<Promise<void>, [string]>();
    public override getSignedUrl = jest.fn<Promise<string>, [string, number]>();
    public override exists = jest.fn<Promise<boolean>, [string]>();
}
