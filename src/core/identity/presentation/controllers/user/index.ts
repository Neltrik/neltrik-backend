import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
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

import { CurrentUser } from "@/shared/auth";
import { Permissions } from "@/shared/authorization";
import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/zod";

import {
    ChangeRoleUserInput,
    ChangeRoleUserUseCase,
    GetUsersUseCase,
    ReactivateUserUseCase,
    SuspendUserUseCase,
} from "../../../application/use-cases";
import {
    ChangeRoleUserRequestDto,
    GetUsersResultDto,
    ReactivateUserParamsDto,
    SuspendUserParamsDto,
    UpdateUserParamsDto,
    UpdateUserResultDto,
} from "../../dto/user";
import { USER_MESSAGES } from "../../messages";
import {
    changeRoleUserParamsSchema,
    changeRoleUserSchema,
    reactivateUserParamsSchema,
    suspendUserParamsSchema,
} from "../../schemas";

@ApiTags("Users")
@Controller()
export class UserController {
    constructor(
        private readonly changeRoleUserUseCase: ChangeRoleUserUseCase,
        private readonly getUsersUseCase: GetUsersUseCase,
        private readonly reactivateUserUseCase: ReactivateUserUseCase,
        private readonly suspendUserUseCase: SuspendUserUseCase,
    ) {}

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
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: USER_MESSAGES.UPDATED,
    })
    @Permissions("USER_UPDATE")
    @Patch("users/:id")
    public async changeRole(
        @Param(new ZodValidationPipe(changeRoleUserSchema))
        params: UpdateUserParamsDto,
        @Body(new ZodValidationPipe(changeRoleUserParamsSchema))
        body: ChangeRoleUserRequestDto,
    ): Promise<UpdateUserResultDto> {
        const input: ChangeRoleUserInput = {
            id: params.id,
            roleId: body.roleId,
        };
        const user = await this.changeRoleUserUseCase.execute(input);
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
        message: USER_MESSAGES.LISTED,
    })
    @Permissions("USER_LIST")
    @Get("users")
    public async list(): Promise<GetUsersResultDto[]> {
        const users = await this.getUsersUseCase.execute();
        return users.map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email.value,
            role: { id: user.role.id, code: user.role.code, scope: user.role.scope },
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
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: USER_MESSAGES.SUSPENDED,
    })
    @Permissions("USER_SUSPEND")
    @Patch("users/:id/suspend")
    public async suspend(
        @CurrentUser("userId") actorUserId: string,
        @Param(new ZodValidationPipe(suspendUserParamsSchema))
        params: SuspendUserParamsDto,
    ): Promise<void> {
        await this.suspendUserUseCase.execute({ actorUserId, targetUserId: params.id });
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
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: USER_MESSAGES.REACTIVATED,
    })
    @Permissions("USER_REACTIVATE")
    @Patch("users/:id/reactivate")
    public async reactivate(
        @Param(new ZodValidationPipe(reactivateUserParamsSchema))
        params: ReactivateUserParamsDto,
    ): Promise<void> {
        await this.reactivateUserUseCase.execute(params.id);
    }
}
