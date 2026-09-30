import { Module } from "@nestjs/common";

import { FileRepository } from "./domain/interfaces";
import { PrismaFileRepository } from "./infrastructure/repositories";

@Module({
    providers: [
        {
            provide: FileRepository,
            useClass: PrismaFileRepository,
        },
    ],
})
export class FileStorageModule {}
