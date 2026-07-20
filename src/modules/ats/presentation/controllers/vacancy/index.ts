import { Body, Controller, Get, HttpStatus, Param, Post } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";

import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/pipes/zod-validation";

import {
    CreateVacancyInput,
    CreateVacancyUseCase,
    GetVacancyUseCase,
    ListVacanciesUseCase,
} from "../../../application/use-cases";
import {
    CreateVacancyRequestDto,
    CreateVacancyResultDto,
    GetVacancyRequestDto,
    GetVacancyResultDto,
    VacancyDto,
} from "../../dto/vacancy";
import { VACANCY_MESSAGES } from "../../messages";
import { createVacancySchema, getVacancySchema } from "../../schemas/vacancy";

@ApiTags("Vacancies")
@Controller("vacancies")
export class VacancyController {
    constructor(
        private readonly createVacancyUseCase: CreateVacancyUseCase,
        private readonly listVacanciesUseCase: ListVacanciesUseCase,
        private readonly getVacancyUseCase: GetVacancyUseCase,
    ) {}

    @ApiOperation({
        summary: "Create vacancy",
        description: "Creates a new vacancy.",
    })
    @ApiContract(CreateVacancyResultDto, { status: HttpStatus.CREATED })
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

    @ApiOperation({
        summary: "List vacancies",
        description: "Returns the list of vacancies.",
    })
    @ApiContract(VacancyDto, { responseType: "array" })
    @ApiOkResponse({
        description: "Resources retrieved successfully.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_LISTED,
        message: VACANCY_MESSAGES.LISTED,
    })
    @Get()
    public async list(): Promise<VacancyDto[]> {
        const vacancies = await this.listVacanciesUseCase.execute();
        return vacancies.map((vacancy) => ({
            id: vacancy.id,
            title: vacancy.title,
            employmentType: vacancy.employmentType,
            workMode: vacancy.workMode,
            status: vacancy.status,
            location: vacancy.location,
            salary: vacancy.salary,
            closingDate: vacancy.closingDate,
            createdAt: vacancy.createdAt,
        }));
    }

    @ApiOperation({
        summary: "Get vacancy",
        description: "Returns the details of a vacancy.",
    })
    @ApiContract(GetVacancyResultDto)
    @ApiOkResponse({
        description: "Resource found.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiNotFoundResponse({
        description: "Resource not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_FOUND,
        message: VACANCY_MESSAGES.RETRIEVED,
    })
    @Get(":id")
    public async get(
        @Param(new ZodValidationPipe(getVacancySchema))
        params: GetVacancyRequestDto,
    ): Promise<GetVacancyResultDto> {
        const vacancy = await this.getVacancyUseCase.execute(params.id);
        return {
            id: vacancy.id,
            title: vacancy.title,
            employmentType: vacancy.employmentType,
            workMode: vacancy.workMode,
            status: vacancy.status,
            location: vacancy.location,
            salary: vacancy.salary,
            closingDate: vacancy.closingDate,
            createdAt: vacancy.createdAt,
        };
    }
}
