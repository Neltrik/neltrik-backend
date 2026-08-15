import { Body, Controller, Get, HttpStatus, Param, Patch, Post } from "@nestjs/common";
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
    GetUsersUseCase,
    ReactivateUserUseCase,
    RegisterUserInput,
    RegisterUserUseCase,
    SuspendUserUseCase,
    UpdateUserInput,
    UpdateUserUseCase,
} from "../../../application/use-cases";
import {
    GetUsersParamsDto,
    GetUsersResultDto,
    ReactivateUserParamsDto,
    RegisterUserRequestDto,
    RegisterUserResultDto,
    SuspendUserParamsDto,
    SuspendUserRequestDto,
    UpdateUserParamsDto,
    UpdateUserRequestDto,
    UpdateUserResultDto,
} from "../../dto/user";
import { USER_MESSAGES } from "../../messages";
import {
    getUsersParamsSchema,
    reactivateUserParamsSchema,
    registerUserSchema,
    suspendUserParamsSchema,
    updateUserParamsSchema,
    updateUserSchema,
} from "../../schemas";

@ApiTags("Users")
@Controller()
export class UserController {
    constructor(
        private readonly getUsersUseCase: GetUsersUseCase,
        private readonly reactivateUserUseCase: ReactivateUserUseCase,
        private readonly registerUserUseCase: RegisterUserUseCase,
        private readonly suspendUserUseCase: SuspendUserUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
    ) {}

    @ApiOperation({
        summary: "Register user",
        description: "Registers a new user.",
    })
    @ApiContract(RegisterUserResultDto, {
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
        message: USER_MESSAGES.CREATED,
    })
    @Post("users")
    public async create(
        @Body(new ZodValidationPipe(registerUserSchema))
        body: RegisterUserRequestDto,
    ): Promise<RegisterUserResultDto> {
        const input: RegisterUserInput = {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            tenantId: body.tenantId,
            roleId: body.roleId,
        };
        const user = await this.registerUserUseCase.execute(input);
        return { id: user.id };
    }

    @ApiOperation({
        summary: "Update user",
        description: "Updates a user.",
    })
    @ApiContract(UpdateUserResultDto)
    @ApiOkResponse({
        description: "Resource updated.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiNotFoundResponse({
        description: "User not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: USER_MESSAGES.UPDATED,
    })
    @Patch("users/:id")
    public async update(
        @Param(new ZodValidationPipe(updateUserParamsSchema))
        params: UpdateUserParamsDto,
        @Body(new ZodValidationPipe(updateUserSchema))
        body: UpdateUserRequestDto,
    ): Promise<UpdateUserResultDto> {
        const input: UpdateUserInput = {
            id: params.id,
        };
        if (body.firstName !== undefined) {
            input.firstName = body.firstName;
        }
        if (body.lastName !== undefined) {
            input.lastName = body.lastName;
        }
        if (body.roleId !== undefined) {
            input.roleId = body.roleId;
        }
        const user = await this.updateUserUseCase.execute(input);
        return { id: user.id };
    }

    @ApiOperation({
        summary: "List users",
        description: "Returns the list of users belonging to a tenant.",
    })
    @ApiContract(GetUsersResultDto, { responseType: "array" })
    @ApiOkResponse({
        description: "Resources retrieved successfully.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_LISTED,
        message: USER_MESSAGES.LISTED,
    })
    @Get("tenants/:tenantId/users")
    public async list(
        @Param(new ZodValidationPipe(getUsersParamsSchema))
        params: GetUsersParamsDto,
    ): Promise<GetUsersResultDto[]> {
        const users = await this.getUsersUseCase.execute({ tenantId: params.tenantId });
        return users.map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email.value,
            roleId: user.roleId,
            status: user.status,
        }));
    }

    @ApiOperation({
        summary: "Suspend user",
        description: "Suspends a user.",
    })
    @ApiNoContentResponse({
        description: "Resource suspended.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiNotFoundResponse({
        description: "User not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: USER_MESSAGES.SUSPENDED,
    })
    @Patch("users/:id/suspend")
    public async suspend(
        @Param(new ZodValidationPipe(suspendUserParamsSchema))
        params: SuspendUserParamsDto,
        @Body() body: SuspendUserRequestDto,
    ): Promise<void> {
        await this.suspendUserUseCase.execute({
            actorUserId: body.actorUserId,
            targetUserId: params.id,
        });
    }

    @ApiOperation({
        summary: "Reactivate user",
        description: "Reactivates a suspended user.",
    })
    @ApiNoContentResponse({
        description: "Resource reactivated.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiNotFoundResponse({
        description: "User not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: USER_MESSAGES.REACTIVATED,
    })
    @Patch("users/:id/reactivate")
    public async reactivate(
        @Param(new ZodValidationPipe(reactivateUserParamsSchema))
        params: ReactivateUserParamsDto,
    ): Promise<void> {
        await this.reactivateUserUseCase.execute(params.id);
    }
}
