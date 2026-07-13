import { type INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function configureSwagger(app: INestApplication): void {
    const config = new DocumentBuilder()
        .setTitle("Neltrik API")
        .setDescription("REST API for Neltrik.")
        .setVersion("1.0.0")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);
}
