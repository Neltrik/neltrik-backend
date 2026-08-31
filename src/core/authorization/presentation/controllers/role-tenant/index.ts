import { Body, Controller, Delete, Get, HttpStatus, Param, Post } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { TenantId } from "@/shared/auth";
import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/zod";

import {
    AssociateRolesToTenantInput,
    AssociateRolesToTenantUseCase,
    DisassociateRolesFromTenantUseCase,
    GetRolesByTenantUseCase,
} from "../../../application/use-cases";
import {
    AssociateRolesToTenantRequestDto,
    AssociateRolesToTenantResultDto,
    DisassociateRolesFromTenantRequestDto,
    RoleResultDto,
} from "../../dto";
import { ROLE_TENANT_MESSAGES } from "../../messages";
import { associateRolesToTenantSchema, disassociateRolesFromTenantSchema, roleTenantParamsSchema } from "../../schemas";

@ApiTags("Role-Tenant")
@Controller("tenants/:tenantId/roles")
export class RoleTenantController {
    constructor(
        private readonly associateRolesToTenantUseCase: AssociateRolesToTenantUseCase,
        private readonly disassociateRolesFromTenantUseCase: DisassociateRolesFromTenantUseCase,
        private readonly getRolesByTenantUseCase: GetRolesByTenantUseCase,
    ) {}

    @ApiOperation({
        summary: "Associate roles to tenant",
        description: "Associates one or multiple roles with a tenant.",
    })
    @ApiContract(AssociateRolesToTenantResultDto, {
        status: HttpStatus.OK,
    })
    @ApiOkResponse({
        description: "Roles associated successfully.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiUnauthorizedResponse({
        description: "Unauthorized.",
    })
    @ApiForbiddenResponse({
        description: "Forbidden.",
    })
    @ApiNotFoundResponse({
        description: "Tenant or role not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: ROLE_TENANT_MESSAGES.ASSOCIATED,
    })
    @Post()
    public async associate(
        @TenantId() actorTenantId: string,
        @Param(new ZodValidationPipe(roleTenantParamsSchema))
        params: { tenantId: string },
        @Body(new ZodValidationPipe(associateRolesToTenantSchema))
        body: AssociateRolesToTenantRequestDto,
    ): Promise<AssociateRolesToTenantResultDto> {
        const input: AssociateRolesToTenantInput = {
            actorTenantId,
            targetTenantId: params.tenantId,
            roleIds: body.roleIds,
        };
        return this.associateRolesToTenantUseCase.execute(input);
    }

    @ApiOperation({
        summary: "Disassociate roles from tenant",
        description: "Disassociates one or multiple roles from a tenant.",
    })
    @ApiNoContentResponse({
        description: "Roles disassociated successfully.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiUnauthorizedResponse({
        description: "Unauthorized.",
    })
    @ApiForbiddenResponse({
        description: "Forbidden.",
    })
    @ApiNotFoundResponse({
        description: "Tenant not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_DELETED,
        message: ROLE_TENANT_MESSAGES.DISASSOCIATED,
    })
    @Delete()
    public async disassociate(
        @TenantId() actorTenantId: string,
        @Param(new ZodValidationPipe(roleTenantParamsSchema))
        params: { tenantId: string },
        @Body(new ZodValidationPipe(disassociateRolesFromTenantSchema))
        body: DisassociateRolesFromTenantRequestDto,
    ): Promise<void> {
        await this.disassociateRolesFromTenantUseCase.execute({
            actorTenantId,
            targetTenantId: params.tenantId,
            roleIds: body.roleIds,
        });
    }

    @ApiOperation({
        summary: "Get roles enabled for tenant",
        description: "Returns the roles currently enabled for the specified tenant.",
    })
    @ApiContract(RoleResultDto, { responseType: "array" })
    @ApiOkResponse({
        description: "Roles retrieved successfully.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiUnauthorizedResponse({
        description: "Unauthorized.",
    })
    @ApiForbiddenResponse({
        description: "Forbidden.",
    })
    @ApiNotFoundResponse({
        description: "Tenant not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_LISTED,
        message: ROLE_TENANT_MESSAGES.LISTED,
    })
    @Get()
    public async getRoles(
        @Param(new ZodValidationPipe(roleTenantParamsSchema))
        params: {
            tenantId: string;
        },
    ): Promise<RoleResultDto[]> {
        const roles = await this.getRolesByTenantUseCase.execute(params.tenantId);
        return roles.map((role) => ({
            id: role.id,
            code: role.code,
            defaultDisplayName: role.defaultDisplayName,
            description: role.description,
            scope: role.scope,
        }));
    }
}
