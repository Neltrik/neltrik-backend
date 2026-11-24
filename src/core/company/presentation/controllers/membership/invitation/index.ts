import { Body, Controller, Headers, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { CurrentUser } from "@/shared/auth";
import { Permissions, PublicPermission, WithoutCompany } from "@/shared/authorization";
import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/zod";

import { AcceptInvitationUseCase, InviteMemberUseCase } from "../../../../application/use-cases";
import {
    AcceptInvitationParamsDto,
    AcceptInvitationResponseDto,
    InviteMemberRequestDto,
    InviteMemberResponseDto,
} from "../../../dto";
import { MEMBERSHIP_MESSAGES } from "../../../messages";
import { acceptInvitationParamsSchema, inviteMemberSchema } from "../../../schemas";

@ApiTags("Memberships")
@Controller("memberships")
export class InvitationController {
    constructor(
        private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
        private readonly inviteMemberUseCase: InviteMemberUseCase,
    ) {}

    @ApiOperation({
        summary: "Invite member",
        description: "Invites a user to the active company with a specific role.",
    })
    @ApiContract(InviteMemberResponseDto)
    @ApiCreatedResponse({ description: "Resource created." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "User, company, or role not found." })
    @ApiConflictResponse({ description: "User is already a member of this company." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_CREATED, message: MEMBERSHIP_MESSAGES.INVITED })
    @Throttle({ default: { limit: 3, ttl: 3600000 } })
    @Permissions("ADMIN_MEMBERSHIP_INVITE")
    @Post("invite")
    public async invite(
        @CurrentUser("userId") userId: string,
        @CurrentUser("tenantId") tenantId: string,
        @Headers("x-company-id") companyId: string,
        @Body(new ZodValidationPipe(inviteMemberSchema)) body: InviteMemberRequestDto,
    ): Promise<InviteMemberResponseDto> {
        const output = await this.inviteMemberUseCase.execute({
            tenantId,
            actorUserId: userId,
            companyId,
            userId: body.userId,
            roleId: body.roleId,
        });
        return { id: output.id };
    }

    @ApiOperation({
        summary: "Accept invitation",
        description: "Accepts a pending invitation addressed to the authenticated user (PENDING → ACTIVE).",
    })
    @ApiContract(AcceptInvitationResponseDto)
    @ApiOkResponse({ description: "Resource updated." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "Membership not found." })
    @ApiConflictResponse({ description: "Membership is not pending or has expired." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_UPDATED, message: MEMBERSHIP_MESSAGES.ACCEPTED })
    @Throttle({ default: { limit: 20, ttl: 900000 } })
    @WithoutCompany()
    @PublicPermission()
    @HttpCode(HttpStatus.OK)
    @Patch(":id/accept")
    public async accept(
        @CurrentUser("userId") userId: string,
        @Param(new ZodValidationPipe(acceptInvitationParamsSchema)) params: AcceptInvitationParamsDto,
    ): Promise<AcceptInvitationResponseDto> {
        const output = await this.acceptInvitationUseCase.execute({ actorUserId: userId, membershipId: params.id });
        return { id: output.id };
    }
}
