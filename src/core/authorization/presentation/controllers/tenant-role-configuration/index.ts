import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";

import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/pipes/zod-validation";

import {
    CreateTenantRoleConfigurationInput,
    CreateTenantRoleConfigurationUseCase,
    DeleteTenantRoleConfigurationUseCase,
    ListTenantRoleConfigurationUseCase,
    UpdateTenantRoleConfigurationInput,
    UpdateTenantRoleConfigurationUseCase,
} from "../../../application/use-cases";
import {
    CreateTenantRoleConfigurationDto,
    CreateTenantRoleConfigurationResultDto,
    DeleteTenantRoleConfigurationParamsDto,
    TenantRoleConfigurationResultDto,
    UpdateTenantRoleConfigurationParamsDto,
    UpdateTenantRoleConfigurationRequestDto,
    UpdateTenantRoleConfigurationResultDto,
} from "../../dto/tenant-role-configuration";
import { TENANT_ROLE_CONFIGURATION_MESSAGES } from "../../messages";
import {
    createTenantRoleConfigurationSchema,
    tenantRoleConfigurationParamsSchema,
    updateTenantRoleConfigurationSchema,
} from "../../schemas";

@ApiTags("Tenant Role Configurations")
@Controller("tenant-role-configurations")
export class TenantRoleConfigurationController {
    constructor(
        private readonly createTenantRoleConfigurationUseCase: CreateTenantRoleConfigurationUseCase,
        private readonly updateTenantRoleConfigurationUseCase: UpdateTenantRoleConfigurationUseCase,
        private readonly deleteTenantRoleConfigurationUseCase: DeleteTenantRoleConfigurationUseCase,
        private readonly listTenantRoleConfigurationUseCase: ListTenantRoleConfigurationUseCase,
    ) {}

    @ApiOperation({
        summary: "Create tenant role configuration",
        description: "Creates a tenant role configuration.",
    })
    @ApiContract(CreateTenantRoleConfigurationResultDto, {
        status: HttpStatus.CREATED,
    })
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
        message: TENANT_ROLE_CONFIGURATION_MESSAGES.CREATED,
    })
    @Post()
    public async create(
        @Body(new ZodValidationPipe(createTenantRoleConfigurationSchema))
        body: CreateTenantRoleConfigurationDto,
    ): Promise<CreateTenantRoleConfigurationResultDto> {
        const input: CreateTenantRoleConfigurationInput = {
            tenantId: body.tenantId,
            roleId: body.roleId,
            displayName: body.displayName,
        };
        const configuration = await this.createTenantRoleConfigurationUseCase.execute(input);
        return { id: configuration.id };
    }

    @ApiOperation({
        summary: "Update tenant role configuration",
        description: "Updates a tenant role configuration.",
    })
    @ApiContract(UpdateTenantRoleConfigurationResultDto)
    @ApiOkResponse({
        description: "Resource updated.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiNotFoundResponse({
        description: "Tenant role configuration not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: TENANT_ROLE_CONFIGURATION_MESSAGES.UPDATED,
    })
    @Patch(":id")
    public async update(
        @Param(new ZodValidationPipe(tenantRoleConfigurationParamsSchema))
        params: UpdateTenantRoleConfigurationParamsDto,
        @Body(new ZodValidationPipe(updateTenantRoleConfigurationSchema))
        body: UpdateTenantRoleConfigurationRequestDto,
    ): Promise<UpdateTenantRoleConfigurationResultDto> {
        const input: UpdateTenantRoleConfigurationInput = {
            id: params.id,
            displayName: body.displayName,
        };
        const configuration = await this.updateTenantRoleConfigurationUseCase.execute(input);
        return { id: configuration.id };
    }

    @ApiOperation({
        summary: "Delete tenant role configuration",
        description: "Deletes a tenant role configuration.",
    })
    @ApiNoContentResponse({
        description: "Resource deleted.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiNotFoundResponse({
        description: "Tenant role configuration not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_DELETED,
        message: TENANT_ROLE_CONFIGURATION_MESSAGES.DELETED,
    })
    @Delete(":id")
    public async delete(
        @Param(new ZodValidationPipe(tenantRoleConfigurationParamsSchema))
        params: DeleteTenantRoleConfigurationParamsDto,
    ): Promise<void> {
        await this.deleteTenantRoleConfigurationUseCase.execute(params.id);
    }

    @ApiOperation({
        summary: "List tenant role configurations",
        description: "Returns the list of tenant role configurations.",
    })
    @ApiContract(TenantRoleConfigurationResultDto, {
        responseType: "array",
    })
    @ApiOkResponse({
        description: "Resources retrieved successfully.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_LISTED,
        message: TENANT_ROLE_CONFIGURATION_MESSAGES.LISTED,
    })
    @Get(":tenantId")
    public async list(
        @Param("tenantId")
        tenantId: string,
    ): Promise<TenantRoleConfigurationResultDto[]> {
        const configurations = await this.listTenantRoleConfigurationUseCase.execute(tenantId);
        return configurations.map((configuration) => ({
            id: configuration.id,
            tenantId: configuration.tenantId,
            roleId: configuration.roleId,
            displayName: configuration.displayName.value,
        }));
    }
}
