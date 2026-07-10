import { Global, Module } from "@nestjs/common";

import { IdGenerator, UuidIdGenerator } from "./id-generator.service";

@Global()
@Module({
    providers: [
        {
            provide: IdGenerator,
            useClass: UuidIdGenerator,
        },
    ],
    exports: [IdGenerator],
})
export class IdGeneratorModule {}
