import { Module } from "@nestjs/common";

import { VacancyRepository } from "./domain/interfaces/vacancy-repository";
import { PrismaVacancyRepository } from "./infrastructure/repositories/prisma-vacancy-repository";

@Module({
    providers: [
        {
            provide: VacancyRepository,
            useClass: PrismaVacancyRepository,
        },
    ],
})
export class AtsModule {}
