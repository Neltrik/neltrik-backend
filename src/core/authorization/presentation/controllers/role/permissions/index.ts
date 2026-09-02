import { Body, Controller, Delete, Get, HttpStatus, Param, Post } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { Permissions } from "@/shared/authorization";
import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/zod";

import {
    AssignPermissionsToRoleInput,
    AssignPermissionsToRoleUseCase,
    GetPermissionsByRoleUseCase,
    RemovePermissionsFromRoleInput,
    RemovePermissionsFromRoleUseCase,
} from "../../../../application/use-cases";
import {
    AssignPermissionsToRoleRequestDto,
    AssignPermissionsToRoleResultDto,
    GetPermissionsByRoleParamsDto,
    GetPermissionsByRoleResultDto,
    RemovePermissionsFromRoleRequestDto,
    RemovePermissionsFromRoleResultDto,
    UpdateRoleParamsDto,
} from "../../../dto";
import { ROLE_MESSAGES } from "../../../messages";
import { assignPermissionsToRoleSchema, removePermissionsFromRoleSchema, roleParamsSchema } from "../../../schemas";

@ApiTags("Roles")
@Controller("roles")
export class RolePermissionsController {
    constructor(
        private readonly assignPermissionsToRoleUseCase: AssignPermissionsToRoleUseCase,
        private readonly getPermissionsByRoleUseCase: GetPermissionsByRoleUseCase,
        private readonly removePermissionsFromRoleUseCase: RemovePermissionsFromRoleUseCase,
    ) {}

    @ApiOperation({
        summary: "Assign permissions to role",
        description: "Assigns one or multiple permissions to a role.",
    })
    @ApiContract(AssignPermissionsToRoleResultDto, {
        status: HttpStatus.OK,
    })
    @ApiOkResponse({
        description: "Permissions assigned successfully.",
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
        description: "Role or permission not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: ROLE_MESSAGES.ASSIGNED,
    })
    @Permissions("ROLE_ASSIGN_PERMISSIONS")
    @Post(":id/permissions")
    public async assignPermissions(
        @Param(new ZodValidationPipe(roleParamsSchema))
        params: UpdateRoleParamsDto,
        @Body(new ZodValidationPipe(assignPermissionsToRoleSchema))
        body: AssignPermissionsToRoleRequestDto,
    ): Promise<AssignPermissionsToRoleResultDto> {
        const input: AssignPermissionsToRoleInput = {
            roleId: params.id,
            permissionIds: body.permissionIds,
        };
        const role = await this.assignPermissionsToRoleUseCase.execute(input);
        return { id: role.id };
    }

    @ApiOperation({
        summary: "Remove permissions from role",
        description: "Removes one or multiple permissions from a role.",
    })
    @ApiContract(RemovePermissionsFromRoleResultDto, {
        status: HttpStatus.OK,
    })
    @ApiOkResponse({
        description: "Permissions removed successfully.",
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
        description: "Role or permission not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: ROLE_MESSAGES.REMOVED,
    })
    @Permissions("ROLE_REMOVE_PERMISSIONS")
    @Delete(":id/permissions")
    public async removePermissions(
        @Param(new ZodValidationPipe(roleParamsSchema))
        params: UpdateRoleParamsDto,
        @Body(new ZodValidationPipe(removePermissionsFromRoleSchema))
        body: RemovePermissionsFromRoleRequestDto,
    ): Promise<RemovePermissionsFromRoleResultDto> {
        const input: RemovePermissionsFromRoleInput = {
            roleId: params.id,
            permissionIds: body.permissionIds,
        };
        const role = await this.removePermissionsFromRoleUseCase.execute(input);
        return { id: role.id };
    }

    @ApiOperation({
        summary: "Get permissions by role",
        description: "Returns the permissions associated with a role.",
    })
    @ApiContract(GetPermissionsByRoleResultDto)
    @ApiOkResponse({
        description: "Permissions retrieved successfully.",
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
        description: "Role not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_LISTED,
        message: ROLE_MESSAGES.LISTED,
    })
    @Permissions("ROLE_VIEW_PERMISSIONS")
    @Get(":id/permissions")
    public async getPermissionsByRole(
        @Param(new ZodValidationPipe(roleParamsSchema))
        params: GetPermissionsByRoleParamsDto,
    ): Promise<GetPermissionsByRoleResultDto> {
        const permissions = await this.getPermissionsByRoleUseCase.execute(params.id);
        return {
            permissions: permissions.map((permission) => ({
                id: permission.id,
                code: permission.code,
                description: permission.description,
                scope: permission.scope,
            })),
        };
    }
}
