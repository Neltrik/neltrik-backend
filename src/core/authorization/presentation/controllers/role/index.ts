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
    CreateRoleInput,
    CreateRoleUseCase,
    GetRolesUseCase,
    UpdateRoleInput,
    UpdateRoleUseCase,
} from "../../../application/use-cases";
import {
    CreateRoleRequestDto,
    CreateRoleResultDto,
    RoleParamsDto,
    RoleResultDto,
    UpdateRoleRequestDto,
    UpdateRoleResultDto,
} from "../../dto/role";
import { ROLE_MESSAGES } from "../../messages";
import { createRoleSchema, roleParamsSchema, updateRoleSchema } from "../../schemas";

@ApiTags("Roles")
@Controller("roles")
export class RoleController {
    constructor(
        private readonly createRoleUseCase: CreateRoleUseCase,
        private readonly updateRoleUseCase: UpdateRoleUseCase,
        private readonly getRolesUseCase: GetRolesUseCase,
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
        params: RoleParamsDto,
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
        const roles = await this.getRolesUseCase.execute();
        return roles.map((role) => ({
            id: role.id,
            code: role.code,
            defaultDisplayName: role.defaultDisplayName,
            description: role.description,
        }));
    }
}
