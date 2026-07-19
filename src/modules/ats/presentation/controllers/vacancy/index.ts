import { Body, Controller, Post } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";

import { ApiResponseContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/pipes/zod-validation";

import { CreateVacancyInput, CreateVacancyUseCase } from "../../../application/use-cases/create-vacancy";
import { CreateVacancyRequestDto, CreateVacancyResultDto } from "../../dto/vacancy";
import { VACANCY_MESSAGES } from "../../messages";
import { createVacancySchema } from "../../schemas/vacancy";

@ApiTags("Vacancies")
@Controller("vacancies")
export class VacancyController {
    constructor(private readonly createVacancyUseCase: CreateVacancyUseCase) {}

    @ApiOperation({
        summary: "Create vacancy",
        description: "Creates a new vacancy.",
    })
    @ApiResponseContract(CreateVacancyResultDto)
    @ApiCreatedResponse({
        description: "Resource created.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_CREATED,
        message: VACANCY_MESSAGES.CREATED,
    })
    @Post()
    public async create(
        @Body(new ZodValidationPipe(createVacancySchema))
        body: CreateVacancyRequestDto,
    ): Promise<CreateVacancyResultDto> {
        const input: CreateVacancyInput = {
            title: body.title,
            description: body.description,
            tenantId: body.tenantId,
            recruiterId: body.recruiterId,
            employmentType: body.employmentType,
            workMode: body.workMode,
            closingDate: new Date(body.closingDate),
            salary: body.salary,
            location: body.location,
        };
        const vacancy = await this.createVacancyUseCase.execute(input);
        return { id: vacancy.id };
    }
}
