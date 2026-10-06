import { AntivirusPort, ChecksumGenerator, FileStoragePort } from "../../domain/interfaces";
import { type AntivirusScan } from "../../domain/value-objects";

export class FileStoragePortSpy extends FileStoragePort {
    public override upload = jest.fn<Promise<void>, [string, Buffer, string]>();
    public override download = jest.fn<Promise<Buffer>, [string]>();
    public override delete = jest.fn<Promise<void>, [string]>();
    public override getSignedUrl = jest.fn<Promise<string>, [string, number]>();
    public override exists = jest.fn<Promise<boolean>, [string]>();
}

export class AntivirusPortSpy extends AntivirusPort {
    public override scan = jest.fn<Promise<AntivirusScan>, [Buffer]>();
}

export class ChecksumGeneratorSpy extends ChecksumGenerator {
    public override generate = jest.fn<Promise<string>, [Buffer]>();
}
