import { Body, Controller, HttpStatus, Param, Patch, Post } from "@nestjs/common";
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
    RegisterUserInput,
    RegisterUserUseCase,
    UpdateUserInput,
    UpdateUserUseCase,
} from "../../../application/use-cases";
import {
    RegisterUserRequestDto,
    RegisterUserResultDto,
    UpdateUserParamsDto,
    UpdateUserRequestDto,
    UpdateUserResultDto,
} from "../../dto/user";
import { USER_MESSAGES } from "../../messages";
import { registerUserSchema, updateUserParamsSchema, updateUserSchema } from "../../schemas";

@ApiTags("Users")
@Controller("users")
export class UserController {
    constructor(
        private readonly registerUserUseCase: RegisterUserUseCase,
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
    @Post()
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
    @Patch(":id")
    public async update(
        @Param(new ZodValidationPipe(updateUserParamsSchema))
        params: UpdateUserParamsDto,
        @Body(new ZodValidationPipe(updateUserSchema))
        body: UpdateUserRequestDto,
    ): Promise<UpdateUserResultDto> {
        const input: UpdateUserInput = {
            id: params.id,
            firstName: body.firstName,
            lastName: body.lastName,
            roleId: body.roleId,
        };
        const user = await this.updateUserUseCase.execute(input);
        return { id: user.id };
    }
}
