import { Body, Controller, Get, HttpStatus, Param, Patch, Post } from "@nestjs/common";
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
    CreateTenantInput,
    CreateTenantUseCase,
    GetTenantUseCase,
    UpdateTenantInput,
    UpdateTenantUseCase,
} from "../../../application/use-cases";
import {
    CreateTenantRequestDto,
    CreateTenantResultDto,
    GetTenantRequestDto,
    GetTenantResultDto,
    UpdateTenantParamsDto,
    UpdateTenantRequestDto,
    UpdateTenantResultDto,
} from "../../dto/tenant";
import { TENANT_MESSAGES } from "../../messages";
import {
    createTenantSchema,
    getTenantSchema,
    updateTenantParamsSchema,
    updateTenantSchema,
} from "../../schemas/tenant";

@ApiTags("Tenants")
@Controller("tenants")
export class TenantController {
    constructor(
        private readonly createTenantUseCase: CreateTenantUseCase,
        private readonly getTenantUseCase: GetTenantUseCase,
        private readonly updateTenantUseCase: UpdateTenantUseCase,
    ) {}

    @ApiOperation({
        summary: "Create tenant",
        description: "Creates a new tenant.",
    })
    @ApiContract(CreateTenantResultDto, { status: HttpStatus.CREATED })
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
        message: TENANT_MESSAGES.CREATED,
    })
    @Post()
    public async create(
        @Body(new ZodValidationPipe(createTenantSchema))
        body: CreateTenantRequestDto,
    ): Promise<CreateTenantResultDto> {
        const input: CreateTenantInput = {
            name: body.name,
        };
        const tenant = await this.createTenantUseCase.execute(input);
        return { id: tenant.id };
    }

    @ApiOperation({
        summary: "Get tenant",
        description: "Gets a tenant by id.",
    })
    @ApiContract(GetTenantResultDto)
    @ApiOkResponse({
        description: "Resource found.",
    })
    @ApiNotFoundResponse({
        description: "Tenant not found.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_FOUND,
        message: TENANT_MESSAGES.RETRIEVED,
    })
    @Get(":id")
    public async get(
        @Param(new ZodValidationPipe(getTenantSchema))
        params: GetTenantRequestDto,
    ): Promise<GetTenantResultDto> {
        const tenant = await this.getTenantUseCase.execute(params.id);
        return {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status,
            createdAt: tenant.createdAt,
            updatedAt: tenant.updatedAt,
            suspendedAt: tenant.suspendedAt,
        };
    }

    @ApiOperation({
        summary: "Update tenant",
        description: "Updates a tenant.",
    })
    @ApiContract(UpdateTenantResultDto)
    @ApiOkResponse({
        description: "Resource updated.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiNotFoundResponse({
        description: "Tenant not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: TENANT_MESSAGES.UPDATED,
    })
    @Patch(":id")
    public async update(
        @Param(new ZodValidationPipe(updateTenantParamsSchema))
        params: UpdateTenantParamsDto,
        @Body(new ZodValidationPipe(updateTenantSchema))
        body: UpdateTenantRequestDto,
    ): Promise<UpdateTenantResultDto> {
        const input: UpdateTenantInput = { id: params.id, name: body.name };
        const tenant = await this.updateTenantUseCase.execute(input);
        return { id: tenant.id };
    }
}
