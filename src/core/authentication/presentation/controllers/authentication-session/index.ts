import { Body, Controller, HttpCode, HttpStatus, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
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
import type { Request, Response } from "express";

import { AuthenticationGuard } from "@/shared/auth";
import { ApiContract, CookieHelper, Response as ResponseDecorator, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/zod";

import {
    LoginInput,
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
    RevokeSessionUseCase,
} from "../../../application/use-cases";
import { LoginRequestDto, LoginResponseDto, RevokeSessionParamsDto } from "../../dto";
import { AUTH_MESSAGES } from "../../messages";
import { loginSchema, revokeSessionParamsSchema } from "../../schemas";

const MAX_AGE_REFRESH_TOKEN = 7 * 24 * 60 * 60 * 1000;
const MAX_AGE_ACCESS_TOKEN = 15 * 60 * 1000;

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
        private readonly logoutUseCase: LogoutUseCase,
        private readonly revokeSessionUseCase: RevokeSessionUseCase,
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
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @ResponseDecorator({
        code: RESPONSE_CODES.RESOURCE_CREATED,
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
    })
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
        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: MAX_AGE_ACCESS_TOKEN,
        });
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: MAX_AGE_REFRESH_TOKEN,
        });
        return { sessionId: result.sessionId };
    }

    @ApiOperation({
        summary: "Refresh token",
        description: "Renews an access token using a refresh token.",
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({
        description: "Logout successful.",
    })
    @ApiOkResponse({
        description: "Token refreshed successfully.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiNotFoundResponse({
        description: "Session not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @ResponseDecorator({
        code: RESPONSE_CODES.RESOURCE_NO_CONTENT,
        message: AUTH_MESSAGES.REFRESH_SUCCESS,
    })
    @Post("refresh")
    public async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
        const refreshToken = CookieHelper.get(req, "refreshToken");
        const result = await this.refreshTokenUseCase.execute(refreshToken);
        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: MAX_AGE_ACCESS_TOKEN,
        });
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: MAX_AGE_REFRESH_TOKEN,
        });
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
    @ApiNotFoundResponse({
        description: "Session not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @ResponseDecorator({
        code: RESPONSE_CODES.RESOURCE_NO_CONTENT,
        message: AUTH_MESSAGES.LOGOUT_SUCCESS,
    })
    @Post("logout")
    public async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
        const refreshToken = CookieHelper.get(req, "refreshToken");
        await this.logoutUseCase.execute(refreshToken);
        res.cookie("accessToken", "", {
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.cookie("refreshToken", "", {
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
    }

    @ApiOperation({
        summary: "Revoke session",
        description: "Revokes a specific session by its ID.",
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({
        description: "Revokes successful.",
    })
    @ApiOkResponse({
        description: "Session revoked successfully.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiNotFoundResponse({
        description: "Session not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @ResponseDecorator({
        code: RESPONSE_CODES.RESOURCE_NO_CONTENT,
        message: AUTH_MESSAGES.SESSION_REVOKED,
    })
    @Post("sessions/:id/revoke")
    @UseGuards(AuthenticationGuard)
    public async revokeSession(
        @Req() req: Request,
        @Param(new ZodValidationPipe(revokeSessionParamsSchema))
        params: RevokeSessionParamsDto,
    ): Promise<void> {
        await this.revokeSessionUseCase.execute({
            sessionId: params.id,
            userId: req.user?.userId,
        });
    }
}
