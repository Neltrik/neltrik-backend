import { Module } from "@nestjs/common";

import { CreateVacancyUseCase, ListVacanciesUseCase } from "./application/use-cases";
import { VacancyRepository } from "./domain/interfaces/vacancy-repository";
import { PrismaVacancyRepository } from "./infrastructure/repositories/prisma-vacancy-repository";
import { VacancyController } from "./presentation/controllers/vacancy";

@Module({
    controllers: [VacancyController],
    providers: [
        CreateVacancyUseCase,
        ListVacanciesUseCase,
        {
            provide: VacancyRepository,
            useClass: PrismaVacancyRepository,
        },
    ],
})
export class AtsModule {}
