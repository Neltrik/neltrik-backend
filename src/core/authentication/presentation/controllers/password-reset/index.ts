import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";

import { Public, SkipEmailVerification } from "@/shared/auth";
import { PublicPermission } from "@/shared/authorization";
import { Response as ResponseDecorator, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/zod";

import { RequestPasswordResetUseCase, ResetPasswordUseCase } from "../../../application/use-cases";
import { RequestPasswordResetRequestDto, ResetPasswordRequestDto } from "../../dto";
import { PASSWORD_RESET_MESSAGES } from "../../messages";
import { requestPasswordResetSchema, resetPasswordSchema } from "../../schemas";

@ApiTags("Authentication - Password Reset")
@Controller("auth/password")
export class PasswordResetController {
    constructor(
        private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
        private readonly resetPasswordUseCase: ResetPasswordUseCase,
    ) {}

    @ApiOperation({
        summary: "Request password reset",
        description: "Sends a password reset email to the user.",
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({
        description: "Password reset email sent.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiNotFoundResponse({
        description: "Account not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @ResponseDecorator({
        code: RESPONSE_CODES.RESOURCE_NO_CONTENT,
        message: PASSWORD_RESET_MESSAGES.REQUEST_SUCCESS,
    })
    @Public()
    @SkipEmailVerification()
    @PublicPermission()
    @Post("forgot")
    public async requestReset(
        @Body(new ZodValidationPipe(requestPasswordResetSchema))
        body: RequestPasswordResetRequestDto,
    ): Promise<void> {
        await this.requestPasswordResetUseCase.execute(body.email);
    }

    @ApiOperation({
        summary: "Reset password",
        description: "Resets the user's password using a valid token.",
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({
        description: "Password reset successfully.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiNotFoundResponse({
        description: "Reset token not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @ResponseDecorator({
        code: RESPONSE_CODES.RESOURCE_NO_CONTENT,
        message: PASSWORD_RESET_MESSAGES.RESET_SUCCESS,
    })
    @Public()
    @SkipEmailVerification()
    @PublicPermission()
    @Post("reset")
    public async resetPassword(
        @Body(new ZodValidationPipe(resetPasswordSchema))
        body: ResetPasswordRequestDto,
    ): Promise<void> {
        await this.resetPasswordUseCase.execute({ token: body.token, newPassword: body.newPassword });
    }
}
