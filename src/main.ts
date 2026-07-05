import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import compression from "compression";
import helmet from "helmet";

import { AppModule } from "./app.module";
import { env } from "./config";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {
        logger: ["log", "warn", "error"],
    });
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    app.use(helmet());
    app.use(compression());
    app.enableCors({
        origin: env.FRONTEND_URL,
        credentials: true,
    });
    app.setGlobalPrefix("api");
    app.enableVersioning({
        type: VersioningType.URI,
    });
    const logger = new Logger("Bootstrap");
    await app.listen(env.PORT);
    logger.log(`🚀 Server running on http://localhost:${env.PORT}`);
}

void bootstrap();
