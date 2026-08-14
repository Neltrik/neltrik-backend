import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from "@nestjs/common";
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
    AssignPermissionsToRoleInput,
    AssignPermissionsToRoleUseCase,
    CreateRoleInput,
    CreateRoleUseCase,
    GetPermissionsByRoleUseCase,
    ListRolesUseCase,
    RemovePermissionsFromRoleInput,
    RemovePermissionsFromRoleUseCase,
    UpdateRoleInput,
    UpdateRoleUseCase,
} from "../../../application/use-cases";
import {
    AssignPermissionsToRoleRequestDto,
    AssignPermissionsToRoleResultDto,
    CreateRoleRequestDto,
    CreateRoleResultDto,
    GetPermissionsByRoleParamsDto,
    GetPermissionsByRoleResultDto,
    RemovePermissionsFromRoleRequestDto,
    RemovePermissionsFromRoleResultDto,
    RoleResultDto,
    UpdateRoleParamsDto,
    UpdateRoleRequestDto,
    UpdateRoleResultDto,
} from "../../dto";
import { ROLE_MESSAGES } from "../../messages";
import {
    assignPermissionsToRoleSchema,
    createRoleSchema,
    removePermissionsFromRoleSchema,
    roleParamsSchema,
    updateRoleSchema,
} from "../../schemas";

@ApiTags("Roles")
@Controller("roles")
export class RoleController {
    constructor(
        private readonly assignPermissionsToRoleUseCase: AssignPermissionsToRoleUseCase,
        private readonly createRoleUseCase: CreateRoleUseCase,
        private readonly getPermissionsByRoleUseCase: GetPermissionsByRoleUseCase,
        private readonly updateRoleUseCase: UpdateRoleUseCase,
        private readonly listRolesUseCase: ListRolesUseCase,
        private readonly removePermissionsFromRoleUseCase: RemovePermissionsFromRoleUseCase,
    ) {}

    @ApiOperation({
        summary: "Create role",
        description: "Creates a new role.",
    })
    @ApiContract(CreateRoleResultDto, {
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
        message: ROLE_MESSAGES.CREATED,
    })
    @Post()
    public async create(
        @Body(new ZodValidationPipe(createRoleSchema))
        body: CreateRoleRequestDto,
    ): Promise<CreateRoleResultDto> {
        const input: CreateRoleInput = {
            code: body.code,
            defaultDisplayName: body.defaultDisplayName,
            description: body.description,
            scope: body.scope,
        };
        const role = await this.createRoleUseCase.execute(input);
        return { id: role.id };
    }

    @ApiOperation({
        summary: "Update role",
        description: "Updates a role.",
    })
    @ApiContract(UpdateRoleResultDto)
    @ApiOkResponse({
        description: "Resource updated.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiNotFoundResponse({
        description: "Role not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: ROLE_MESSAGES.UPDATED,
    })
    @Patch(":id")
    public async update(
        @Param(new ZodValidationPipe(roleParamsSchema))
        params: UpdateRoleParamsDto,
        @Body(new ZodValidationPipe(updateRoleSchema))
        body: UpdateRoleRequestDto,
    ): Promise<UpdateRoleResultDto> {
        const input: UpdateRoleInput = { id: params.id };
        if (body.defaultDisplayName !== undefined) {
            input.defaultDisplayName = body.defaultDisplayName;
        }
        if (body.description !== undefined) {
            input.description = body.description;
        }
        const role = await this.updateRoleUseCase.execute(input);
        return { id: role.id };
    }

    @ApiOperation({
        summary: "List roles",
        description: "Returns the list of roles.",
    })
    @ApiContract(RoleResultDto, {
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
        message: ROLE_MESSAGES.LISTED,
    })
    @Get()
    public async list(): Promise<RoleResultDto[]> {
        const roles = await this.listRolesUseCase.execute();
        return roles.map((role) => ({
            id: role.id,
            code: role.code,
            defaultDisplayName: role.defaultDisplayName,
            description: role.description,
            scope: role.scope,
        }));
    }

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
