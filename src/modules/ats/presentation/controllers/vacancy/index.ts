import { Body, Controller, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { ZodValidationPipe } from "@/shared/pipes/zod-validation";

import { CreateVacancyInput, CreateVacancyUseCase } from "../../../application/use-cases/create-vacancy";
import { CreateVacancyRequestDto, CreateVacancyResponseDto } from "../../dto/vacancy";
import { createVacancySchema } from "../../schemas/vacancy";

@ApiTags("Vacancies")
@Controller("vacancies")
export class VacancyController {
    constructor(private readonly createVacancyUseCase: CreateVacancyUseCase) {}

    @ApiOperation({
        summary: "Create vacancy",
        description: "Creates a new vacancy.",
    })
    @ApiCreatedResponse({
        type: CreateVacancyResponseDto,
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @Post()
    public async create(
        @Body(new ZodValidationPipe(createVacancySchema))
        body: CreateVacancyRequestDto,
    ): Promise<CreateVacancyResponseDto> {
        const input: CreateVacancyInput = {
            title: body.title,
            description: body.description,
            companyId: body.companyId,
            recruiterId: body.recruiterId,
            employmentType: body.employmentType,
            workMode: body.workMode,
            closingDate: new Date(body.closingDate),
            salary: body.salary,
            location: body.location,
        };
        const vacancy = await this.createVacancyUseCase.execute(input);
        return {
            data: { id: vacancy.id },
            message: "Vacancy created successfully.",
        };
    }
}
