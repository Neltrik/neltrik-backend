import { Module } from "@nestjs/common";

import { CreateVacancyUseCase } from "./application/use-cases/create-vacancy";
import { VacancyRepository } from "./domain/interfaces/vacancy-repository";
import { PrismaVacancyRepository } from "./infrastructure/repositories/prisma-vacancy-repository";

@Module({
    providers: [
        CreateVacancyUseCase,
        {
            provide: VacancyRepository,
            useClass: PrismaVacancyRepository,
        },
    ],
})
export class AtsModule {}
