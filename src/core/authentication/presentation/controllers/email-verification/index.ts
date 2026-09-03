import { Controller, Get, HttpCode, HttpStatus, Post, Query } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { Public, SkipEmailVerification, UserId } from "@/shared/auth";
import { PublicPermission } from "@/shared/authorization";
import { Response as ResponseDecorator, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/zod";

import { RequestEmailVerificationUseCase, ValidateEmailVerificationUseCase } from "../../../application/use-cases";
import { ValidateEmailVerificationQueryDto } from "../../dto";
import { EMAIL_VERIFICATION } from "../../messages";
import { validateEmailVerificationQuerySchema } from "../../schemas";

@ApiTags("Authentication - Email Verification")
@Controller("auth/email/verification")
export class EmailVerificationController {
    constructor(
        private readonly requestEmailVerificationUseCase: RequestEmailVerificationUseCase,
        private readonly validateEmailVerificationUseCase: ValidateEmailVerificationUseCase,
    ) {}

    @ApiOperation({
        summary: "Request email verification",
        description: "Sends a verification email to the authenticated user.",
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({
        description: "Verification email sent.",
    })
    @ApiBadRequestResponse({
        description: "Email already verified.",
    })
    @ApiUnauthorizedResponse({
        description: "Unauthorized.",
    })
    @ApiNotFoundResponse({
        description: "Account not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @ResponseDecorator({
        code: RESPONSE_CODES.RESOURCE_NO_CONTENT,
        message: EMAIL_VERIFICATION.EMAIL_VERIFICATION_REQUEST_SUCCESS,
    })
    @SkipEmailVerification()
    @PublicPermission()
    @Post()
    public async requestVerification(@UserId() userId: string): Promise<void> {
        await this.requestEmailVerificationUseCase.execute(userId);
    }

    @ApiOperation({
        summary: "Validate email verification",
        description: "Validates the email verification token.",
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({
        description: "Email verified successfully.",
    })
    @ApiBadRequestResponse({
        description: "Invalid or expired token.",
    })
    @ApiNotFoundResponse({
        description: "Verification not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @ResponseDecorator({
        code: RESPONSE_CODES.RESOURCE_NO_CONTENT,
        message: EMAIL_VERIFICATION.EMAIL_VERIFICATION_VALIDATE_SUCCESS,
    })
    @Public()
    @SkipEmailVerification()
    @PublicPermission()
    @Get()
    public async validateVerification(
        @Query(new ZodValidationPipe(validateEmailVerificationQuerySchema))
        query: ValidateEmailVerificationQueryDto,
    ): Promise<void> {
        await this.validateEmailVerificationUseCase.execute(query.token);
    }
}
