import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";

import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/pipes/zod-validation";

import { RegisterUserInput, RegisterUserUseCase } from "../../../application/use-cases/create-user";
import { RegisterUserRequestDto, RegisterUserResultDto } from "../../dto/user";
import { USER_MESSAGES } from "../../messages";
import { registerUserSchema } from "../../schemas";

@ApiTags("Users")
@Controller("users")
export class UserController {
    constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

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
}
