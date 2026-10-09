import { NestFactory } from "@nestjs/core";

import { WorkerModule } from "./worker.module";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.createApplicationContext(WorkerModule);
    app.enableShutdownHooks();
}

void bootstrap().catch((error) => {
    console.error("Worker failed to start", error);
    process.exit(1);
});
