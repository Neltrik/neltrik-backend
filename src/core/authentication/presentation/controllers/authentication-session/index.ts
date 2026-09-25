import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";

import { env } from "@/config/env";
import { COOKIE_NAMES, MAX_AGE, Public, SkipEmailVerification, SkipTenantState, SkipUserState } from "@/shared/auth";
import { PublicPermission } from "@/shared/authorization";
import { ApiContract, CookieHelper, Response as ResponseDecorator, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/zod";

import { LoginInput, LoginUseCase, LogoutUseCase, RefreshTokenUseCase } from "../../../application/use-cases";
import { LoginRequestDto, LoginResponseDto } from "../../dto";
import { AUTH_MESSAGES } from "../../messages";
import { loginSchema } from "../../schemas";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
        private readonly logoutUseCase: LogoutUseCase,
    ) {}

    @ApiOperation({
        summary: "Login",
        description: "Authenticates a user and creates a new session.",
    })
    @ApiContract(LoginResponseDto, {
        status: HttpStatus.CREATED,
    })
    @ApiCreatedResponse({
        description: "Login successful.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
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
        code: RESPONSE_CODES.RESOURCE_CREATED,
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
    })
    @Throttle({ default: { limit: 5, ttl: 900000 } })
    @Public()
    @SkipEmailVerification()
    @SkipUserState()
    @SkipTenantState()
    @PublicPermission()
    @Post("login")
    public async login(
        @Body(new ZodValidationPipe(loginSchema))
        body: LoginRequestDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<LoginResponseDto> {
        const input: LoginInput = { email: body.email, password: body.password };
        if (body.ipAddress !== undefined) {
            input.ipAddress = body.ipAddress;
        }
        if (body.userAgent !== undefined) {
            input.userAgent = body.userAgent;
        }
        const result = await this.loginUseCase.execute(input);
        this.setAuthCookies(res, result);
        return { sessionId: result.sessionId };
    }

    @ApiOperation({
        summary: "Refresh token",
        description: "Renews an access token using a refresh token.",
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({
        description: "Refresh successful.",
    })
    @ApiBadRequestResponse({
        description: "Refresh failed.",
    })
    @ApiUnauthorizedResponse({
        description: "Unauthorized.",
    })
    @ApiNotFoundResponse({
        description: "Refresh not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @ResponseDecorator({
        code: RESPONSE_CODES.RESOURCE_NO_CONTENT,
        message: AUTH_MESSAGES.REFRESH_SUCCESS,
    })
    @Throttle({ default: { limit: 30, ttl: 900000 } })
    @Public()
    @SkipEmailVerification()
    @SkipUserState()
    @SkipTenantState()
    @PublicPermission()
    @Post("refresh")
    public async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
        const refreshToken = CookieHelper.get(req, COOKIE_NAMES.REFRESH_TOKEN);
        const result = await this.refreshTokenUseCase.execute(refreshToken);
        this.setAuthCookies(res, result);
    }

    @ApiOperation({
        summary: "Logout",
        description: "Logs out the current session.",
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({
        description: "Logout successful.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiUnauthorizedResponse({
        description: "Unauthorized.",
    })
    @ApiNotFoundResponse({
        description: "Logout not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @ResponseDecorator({
        code: RESPONSE_CODES.RESOURCE_NO_CONTENT,
        message: AUTH_MESSAGES.LOGOUT_SUCCESS,
    })
    @SkipEmailVerification()
    @SkipUserState()
    @SkipTenantState()
    @PublicPermission()
    @Post("logout")
    public async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
        const refreshToken = CookieHelper.get(req, COOKIE_NAMES.REFRESH_TOKEN);
        await this.logoutUseCase.execute(refreshToken);
        const secure = process.env.NODE_ENV === "production" || env.COOKIE_SAME_SITE === "none";
        res.cookie(COOKIE_NAMES.ACCESS_TOKEN, "", {
            maxAge: 0,
            httpOnly: true,
            secure,
            sameSite: env.COOKIE_SAME_SITE,
        });
        res.cookie(COOKIE_NAMES.REFRESH_TOKEN, "", {
            maxAge: 0,
            httpOnly: true,
            secure,
            sameSite: env.COOKIE_SAME_SITE,
        });
        res.cookie(COOKIE_NAMES.CSRF_TOKEN, "", {
            maxAge: 0,
            httpOnly: false,
            secure,
            sameSite: env.COOKIE_SAME_SITE,
        });
    }

    private setAuthCookies(
        res: Response,
        result: { accessToken: string; refreshToken: string; csrfToken: string },
    ): void {
        const secure = process.env.NODE_ENV === "production" || env.COOKIE_SAME_SITE === "none";
        res.cookie(COOKIE_NAMES.ACCESS_TOKEN, result.accessToken, {
            httpOnly: true,
            secure,
            sameSite: env.COOKIE_SAME_SITE,
            maxAge: MAX_AGE.ACCESS_TOKEN,
        });
        res.cookie(COOKIE_NAMES.REFRESH_TOKEN, result.refreshToken, {
            httpOnly: true,
            secure,
            sameSite: env.COOKIE_SAME_SITE,
            maxAge: MAX_AGE.REFRESH_TOKEN,
        });
        res.cookie(COOKIE_NAMES.CSRF_TOKEN, result.csrfToken, {
            httpOnly: false,
            secure,
            sameSite: env.COOKIE_SAME_SITE,
            maxAge: MAX_AGE.ACCESS_TOKEN,
        });
    }
}

export { SessionController } from "./sessions";
