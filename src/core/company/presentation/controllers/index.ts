import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { CurrentUser } from "@/shared/auth";
import { Permissions, PublicPermission } from "@/shared/authorization";
import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ResponsePayload } from "@/shared/pagination";
import { ZodValidationPipe } from "@/shared/zod";

import {
    CreateCompanyUseCase,
    GetCompanyUseCase,
    ListCompaniesUseCase,
    ReactivateCompanyUseCase,
    SuspendCompanyUseCase,
    UpdateCompanyUseCase,
} from "../../application/use-cases";
import {
    CompanyResponseDto,
    CreateCompanyRequestDto,
    CreateCompanyResponseDto,
    GetCompanyParamsDto,
    ListCompaniesQueryDto,
    ReactivateCompanyParamsDto,
    ReactivateCompanyResponseDto,
    SuspendCompanyParamsDto,
    SuspendCompanyResponseDto,
    UpdateCompanyRequestDto,
    UpdateCompanyResponseDto,
} from "../dto";
import { COMPANY_MESSAGES } from "../messages";
import { companyIdParamsSchema, createCompanySchema, listCompaniesQuerySchema, updateCompanySchema } from "../schemas";

@ApiTags("Companies")
@Controller("companies")
export class CompanyController {
    constructor(
        private readonly createCompanyUseCase: CreateCompanyUseCase,
        private readonly getCompanyUseCase: GetCompanyUseCase,
        private readonly listCompaniesUseCase: ListCompaniesUseCase,
        private readonly reactivateCompanyUseCase: ReactivateCompanyUseCase,
        private readonly suspendCompanyUseCase: SuspendCompanyUseCase,
        private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    ) {}

    @ApiOperation({
        summary: "Create company",
        description: "Creates a new company for the authenticated tenant.",
    })
    @ApiContract(CreateCompanyResponseDto)
    @ApiCreatedResponse({ description: "Resource created." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiConflictResponse({ description: "Company slug already exists." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_CREATED, message: COMPANY_MESSAGES.CREATED })
    @Throttle({ default: { limit: 20, ttl: 900000 } })
    @Permissions("ADMIN_COMPANY_CREATE")
    @Post()
    public async create(
        @CurrentUser("tenantId") tenantId: string,
        @Body(new ZodValidationPipe(createCompanySchema)) body: CreateCompanyRequestDto,
    ): Promise<CreateCompanyResponseDto> {
        const output = await this.createCompanyUseCase.execute({
            actorTenantId: tenantId,
            name: body.name,
            slug: body.slug,
        });
        return { id: output.id };
    }

    @ApiOperation({
        summary: "Get company",
        description: "Gets a company by its identifier.",
    })
    @ApiContract(CompanyResponseDto)
    @ApiOkResponse({ description: "Resource found." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "Company not found." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_FOUND, message: COMPANY_MESSAGES.RETRIEVED })
    @Permissions("ADMIN_COMPANY_READ")
    @Get(":id")
    public async get(
        @CurrentUser("tenantId") tenantId: string,
        @Param(new ZodValidationPipe(companyIdParamsSchema)) params: GetCompanyParamsDto,
    ): Promise<CompanyResponseDto> {
        const output = await this.getCompanyUseCase.execute({ actorTenantId: tenantId, id: params.id });
        return {
            id: output.id,
            tenantId: output.tenantId,
            name: output.name,
            slug: output.slug,
            status: output.status,
            createdAt: output.createdAt,
            updatedAt: output.updatedAt,
        };
    }

    @ApiOperation({
        summary: "List companies",
        description: "Lists the companies of the authenticated tenant with cursor pagination.",
    })
    @ApiContract(CompanyResponseDto, { responseType: "array" })
    @ApiOkResponse({ description: "Resource found." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_FOUND, message: COMPANY_MESSAGES.LISTED })
    // @Permissions("ADMIN_COMPANY_LIST")
    @PublicPermission()
    @Get()
    public async list(
        @CurrentUser("tenantId") tenantId: string,
        @Query(new ZodValidationPipe(listCompaniesQuerySchema)) query: ListCompaniesQueryDto,
    ): Promise<ResponsePayload<CompanyResponseDto[]>> {
        const output = await this.listCompaniesUseCase.execute({
            actorTenantId: tenantId,
            cursor: query.cursor,
            limit: query.limit,
        });
        return {
            data: output.companies.map((company) => ({
                id: company.id,
                tenantId: company.tenantId,
                name: company.name,
                slug: company.slug,
                status: company.status,
                createdAt: company.createdAt,
                updatedAt: company.updatedAt,
            })),
            meta: output.meta,
        };
    }

    @ApiOperation({
        summary: "Update company",
        description: "Updates the name and/or slug of a company.",
    })
    @ApiContract(UpdateCompanyResponseDto)
    @ApiOkResponse({ description: "Resource updated." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "Company not found." })
    @ApiConflictResponse({ description: "Company slug already exists." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_UPDATED, message: COMPANY_MESSAGES.UPDATED })
    @Throttle({ default: { limit: 20, ttl: 900000 } })
    @Permissions("ADMIN_COMPANY_UPDATE")
    @Patch(":id")
    public async update(
        @CurrentUser("tenantId") tenantId: string,
        @Param(new ZodValidationPipe(companyIdParamsSchema)) params: GetCompanyParamsDto,
        @Body(new ZodValidationPipe(updateCompanySchema)) body: UpdateCompanyRequestDto,
    ): Promise<UpdateCompanyResponseDto> {
        const output = await this.updateCompanyUseCase.execute({
            actorTenantId: tenantId,
            id: params.id,
            name: body.name,
            slug: body.slug,
        });
        return {
            id: output.id,
            tenantId: output.tenantId,
            name: output.name,
            slug: output.slug,
            status: output.status,
            createdAt: output.createdAt,
            updatedAt: output.updatedAt,
        };
    }

    @ApiOperation({
        summary: "Suspend company",
        description: "Suspends a company (ACTIVE → SUSPENDED).",
    })
    @ApiContract(SuspendCompanyResponseDto)
    @ApiOkResponse({ description: "Resource updated." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "Company not found." })
    @ApiConflictResponse({ description: "Company already suspended." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_UPDATED, message: COMPANY_MESSAGES.SUSPENDED })
    @Throttle({ default: { limit: 20, ttl: 900000 } })
    @Permissions("ADMIN_COMPANY_SUSPEND")
    @HttpCode(HttpStatus.OK)
    @Patch(":id/suspend")
    public async suspend(
        @CurrentUser("tenantId") tenantId: string,
        @Param(new ZodValidationPipe(companyIdParamsSchema)) params: SuspendCompanyParamsDto,
    ): Promise<SuspendCompanyResponseDto> {
        const output = await this.suspendCompanyUseCase.execute({
            actorTenantId: tenantId,
            id: params.id,
        });
        return {
            id: output.id,
            tenantId: output.tenantId,
            name: output.name,
            slug: output.slug,
            status: output.status,
            createdAt: output.createdAt,
            updatedAt: output.updatedAt,
        };
    }

    @ApiOperation({
        summary: "Reactivate company",
        description: "Reactivates a company (SUSPENDED → ACTIVE).",
    })
    @ApiContract(ReactivateCompanyResponseDto)
    @ApiOkResponse({ description: "Resource updated." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "Company not found." })
    @ApiConflictResponse({ description: "Company already active." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_UPDATED, message: COMPANY_MESSAGES.REACTIVATED })
    @Throttle({ default: { limit: 20, ttl: 900000 } })
    @Permissions("ADMIN_COMPANY_REACTIVATE")
    @HttpCode(HttpStatus.OK)
    @Patch(":id/reactivate")
    public async reactivate(
        @CurrentUser("tenantId") tenantId: string,
        @Param(new ZodValidationPipe(companyIdParamsSchema)) params: ReactivateCompanyParamsDto,
    ): Promise<ReactivateCompanyResponseDto> {
        const output = await this.reactivateCompanyUseCase.execute({
            actorTenantId: tenantId,
            id: params.id,
        });
        return {
            id: output.id,
            tenantId: output.tenantId,
            name: output.name,
            slug: output.slug,
            status: output.status,
            createdAt: output.createdAt,
            updatedAt: output.updatedAt,
        };
    }
}
