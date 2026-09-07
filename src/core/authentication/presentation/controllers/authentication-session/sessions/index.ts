// import { Body, Get, UseGuards } from "@nestjs/common";
import { Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { CurrentUser, type UserPayload } from "@/shared/auth";
import { Permissions } from "@/shared/authorization";
import { ApiContract, Response as ResponseDecorator, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/zod";

import { ListSessionsUseCase, RevokeSessionUseCase } from "../../../../application/use-cases";
import { ListSessionsResponseDto, RevokeSessionParamsDto } from "../../../dto";
import { SESSION_MESSAGES } from "../../../messages";
import { revokeSessionParamsSchema } from "../../../schemas";

@ApiTags("Authentication - Sessions")
@Controller("auth/sessions")
export class SessionController {
    constructor(
        private readonly listSessionsUseCase: ListSessionsUseCase,
        private readonly revokeSessionUseCase: RevokeSessionUseCase,
    ) {}

    @ApiOperation({
        summary: "List sessions",
        description: "Returns all sessions for the authenticated user.",
    })
    @ApiContract(ListSessionsResponseDto, { responseType: "array" })
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
    @ResponseDecorator({
        code: RESPONSE_CODES.RESOURCE_LISTED,
        message: SESSION_MESSAGES.LIST_SUCCESS,
    })
    @Permissions("SESSION_LIST")
    @Get()
    public async listSessions(@CurrentUser() user: UserPayload): Promise<ListSessionsResponseDto> {
        const result = await this.listSessionsUseCase.execute(user.userId);
        return {
            sessions: result.sessions.map((session) => ({
                id: session.id,
                ipAddress: session.ipAddress,
                userAgent: session.userAgent,
                lastUsedAt: session.lastUsedAt,
                createdAt: session.createdAt,
                expiresAt: session.expiresAt,
                isRevoked: session.isRevoked,
                isCurrent: session.id === user.sessionId,
            })),
        };
    }

    @ApiOperation({
        summary: "Revoke session",
        description: "Revokes a specific session by its ID.",
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({
        description: "Revokes successful.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiUnauthorizedResponse({
        description: "Unauthorized.",
    })
    @ApiNotFoundResponse({
        description: "Session not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @ResponseDecorator({
        code: RESPONSE_CODES.RESOURCE_NO_CONTENT,
        message: SESSION_MESSAGES.SESSION_REVOKED,
    })
    @Permissions("SESSION_REVOKE")
    @Post("sessions/:id/revoke")
    public async revokeSession(
        @CurrentUser("userId") userId: string,
        @Param(new ZodValidationPipe(revokeSessionParamsSchema))
        params: RevokeSessionParamsDto,
    ): Promise<void> {
        await this.revokeSessionUseCase.execute({ sessionId: params.id, userId });
    }
}
