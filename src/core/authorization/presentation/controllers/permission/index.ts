import { Body, Controller, Get, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { UserId } from "@/shared/auth";
import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/zod";

import {
    CreatePermissionInput,
    CreatePermissionUseCase,
    GetUserEffectivePermissionsUseCase,
    ListPermissionsUseCase,
    UpdatePermissionInput,
    UpdatePermissionUseCase,
} from "../../../application/use-cases";
import {
    CreatePermissionDto,
    CreatePermissionResultDto,
    GetUserEffectivePermissionsResultDto,
    PermissionResultDto,
    UpdatePermissionDto,
    UpdatePermissionParamsDto,
    UpdatePermissionResultDto,
} from "../../dto/permission";
import { PERMISSION_MESSAGES } from "../../messages";
import { createPermissionSchema, permissionParamsSchema, updatePermissionSchema } from "../../schemas";

@ApiTags("Permissions")
@Controller("permissions")
export class PermissionController {
    constructor(
        private readonly createPermissionUseCase: CreatePermissionUseCase,
        private readonly getUserEffectivePermissionsUseCase: GetUserEffectivePermissionsUseCase,
        private readonly updatePermissionUseCase: UpdatePermissionUseCase,
        private readonly listPermissionsUseCase: ListPermissionsUseCase,
    ) {}

    @ApiOperation({
        summary: "Create permission",
        description: "Creates a new permission.",
    })
    @ApiContract(CreatePermissionResultDto, {
        status: HttpStatus.CREATED,
    })
    @ApiCreatedResponse({
        description: "Resource created.",
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
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_CREATED,
        message: PERMISSION_MESSAGES.CREATED,
    })
    @Post()
    public async create(
        @Body(new ZodValidationPipe(createPermissionSchema))
        body: CreatePermissionDto,
    ): Promise<CreatePermissionResultDto> {
        const input: CreatePermissionInput = { code: body.code, description: body.description, scope: body.scope };
        const permission = await this.createPermissionUseCase.execute(input);
        return { id: permission.id };
    }

    @ApiOperation({
        summary: "Update permission",
        description: "Updates a permission.",
    })
    @ApiContract(UpdatePermissionResultDto)
    @ApiOkResponse({
        description: "Resource updated.",
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
        description: "Permission not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: PERMISSION_MESSAGES.UPDATED,
    })
    @Patch(":id")
    public async update(
        @Param(new ZodValidationPipe(permissionParamsSchema))
        params: UpdatePermissionParamsDto,
        @Body(new ZodValidationPipe(updatePermissionSchema))
        body: UpdatePermissionDto,
    ): Promise<UpdatePermissionResultDto> {
        const input: UpdatePermissionInput = { id: params.id };
        if (body.description !== undefined) {
            input.description = body.description;
        }
        const permission = await this.updatePermissionUseCase.execute(input);
        return { id: permission.id };
    }

    @ApiOperation({
        summary: "List permissions",
        description: "Returns the list of permissions.",
    })
    @ApiContract(PermissionResultDto, {
        responseType: "array",
    })
    @ApiOkResponse({
        description: "Resources retrieved successfully.",
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
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_LISTED,
        message: PERMISSION_MESSAGES.LISTED,
    })
    @Get()
    public async list(): Promise<PermissionResultDto[]> {
        const permissions = await this.listPermissionsUseCase.execute();
        return permissions.map((permission) => ({
            id: permission.id,
            code: permission.code,
            description: permission.description,
            scope: permission.scope,
        }));
    }

    @ApiOperation({
        summary: "Get user effective permissions",
        description: "Returns all permissions that the authenticated user has through their role.",
    })
    @ApiContract(GetUserEffectivePermissionsResultDto, {
        responseType: "array",
        status: HttpStatus.OK,
    })
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
        description: "User not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_LISTED,
        message: PERMISSION_MESSAGES.LISTED,
    })
    @Get("me")
    public async getMyPermissions(@UserId() userId: string): Promise<GetUserEffectivePermissionsResultDto[]> {
        const permissions = await this.getUserEffectivePermissionsUseCase.execute(userId);
        return permissions.map((permission) => ({
            id: permission.id,
            code: permission.code,
            description: permission.description,
            scope: permission.scope,
        }));
    }
}
