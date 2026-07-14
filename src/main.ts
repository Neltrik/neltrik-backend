import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import compression from "compression";
import helmet from "helmet";

import { AppModule } from "./app.module";
import { configureSwagger, env } from "./config";
import { GlobalExceptionFilter, ResponseInterceptor } from "./shared/http";
import { SanitizationPipe } from "./shared/sanitization";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {
        logger: ["log", "warn", "error"],
    });
    app.useGlobalPipes(
        app.get(SanitizationPipe),
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    app.useGlobalFilters(app.get(GlobalExceptionFilter));
    app.use(helmet());
    app.use(compression());
    app.enableCors({
        origin: env.FRONTEND_URL,
        credentials: true,
    });
    app.useGlobalInterceptors(app.get(ResponseInterceptor));
    app.setGlobalPrefix("api");
    configureSwagger(app);
    app.enableVersioning({
        type: VersioningType.URI,
    });
    const logger = new Logger("Bootstrap");
    await app.listen(env.PORT);
    logger.log(`🚀 Server running on http://localhost:${env.PORT}`);
}

void bootstrap();
