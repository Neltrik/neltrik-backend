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

import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/zod";

import {
    CreateRoleInput,
    CreateRoleUseCase,
    GetRoleUseCase,
    ListRolesUseCase,
    UpdateRoleInput,
    UpdateRoleUseCase,
} from "../../../application/use-cases";
import {
    CreateRoleRequestDto,
    CreateRoleResultDto,
    GetRoleParamsDto,
    GetRoleResultDto,
    RoleResultDto,
    UpdateRoleParamsDto,
    UpdateRoleRequestDto,
    UpdateRoleResultDto,
} from "../../dto";
import { ROLE_MESSAGES } from "../../messages";
import { createRoleSchema, roleParamsSchema, updateRoleSchema } from "../../schemas";

@ApiTags("Roles")
@Controller("roles")
export class RoleController {
    constructor(
        private readonly createRoleUseCase: CreateRoleUseCase,
        private readonly getRoleUseCase: GetRoleUseCase,
        private readonly updateRoleUseCase: UpdateRoleUseCase,
        private readonly listRolesUseCase: ListRolesUseCase,
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
        summary: "Get role detail",
        description: "Returns a role with its assigned permissions.",
    })
    @ApiContract(GetRoleResultDto)
    @ApiOkResponse({
        description: "Role retrieved successfully.",
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
        code: RESPONSE_CODES.RESOURCE_FOUND,
        message: ROLE_MESSAGES.RETRIEVED,
    })
    @Get(":id")
    public async getRole(
        @Param(new ZodValidationPipe(roleParamsSchema))
        params: GetRoleParamsDto,
    ): Promise<GetRoleResultDto> {
        const role = await this.getRoleUseCase.execute(params.id);
        return {
            id: role.id,
            code: role.code,
            defaultDisplayName: role.defaultDisplayName,
            description: role.description,
            scope: role.scope,
            permissions: role.permissions.map((permission) => ({
                id: permission.id,
                code: permission.code,
                description: permission.description,
                scope: permission.scope,
            })),
        };
    }
}

export { RolePermissionsController } from "./permissions";
