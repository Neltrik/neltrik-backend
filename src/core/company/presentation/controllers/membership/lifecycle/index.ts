import { Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
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
import { Permissions } from "@/shared/authorization";
import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/zod";

import { ReactivateMemberUseCase, RevokeMemberUseCase, SuspendMemberUseCase } from "../../../../application/use-cases";
import {
    ReactivateMemberParamsDto,
    ReactivateMemberResponseDto,
    RevokeMemberParamsDto,
    RevokeMemberResponseDto,
    SuspendMemberParamsDto,
    SuspendMemberResponseDto,
} from "../../../dto";
import { MEMBERSHIP_MESSAGES } from "../../../messages";
import { reactivateMemberParamsSchema, revokeMemberParamsSchema, suspendMemberParamsSchema } from "../../../schemas";

@ApiTags("Memberships")
@Controller("memberships")
export class MemberLifecycleController {
    constructor(
        private readonly reactivateMemberUseCase: ReactivateMemberUseCase,
        private readonly revokeMemberUseCase: RevokeMemberUseCase,
        private readonly suspendMemberUseCase: SuspendMemberUseCase,
    ) {}

    @ApiOperation({
        summary: "Suspend member",
        description: "Suspends a member of the active company (ACTIVE → SUSPENDED).",
    })
    @ApiContract(SuspendMemberResponseDto)
    @ApiOkResponse({ description: "Resource updated." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "Membership not found." })
    @ApiConflictResponse({ description: "Member already suspended." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_UPDATED, message: MEMBERSHIP_MESSAGES.SUSPENDED })
    @Throttle({ default: { limit: 20, ttl: 900000 } })
    @Permissions("ADMIN_MEMBERSHIP_SUSPEND")
    @HttpCode(HttpStatus.OK)
    @Patch(":id/suspend")
    public async suspend(
        @CurrentUser("userId") userId: string,
        @Param(new ZodValidationPipe(suspendMemberParamsSchema)) params: SuspendMemberParamsDto,
    ): Promise<SuspendMemberResponseDto> {
        const output = await this.suspendMemberUseCase.execute({
            actorUserId: userId,
            membershipId: params.id,
        });
        return { id: output.id };
    }

    @ApiOperation({
        summary: "Reactivate member",
        description: "Reactivates a suspended member (SUSPENDED → ACTIVE).",
    })
    @ApiContract(ReactivateMemberResponseDto)
    @ApiOkResponse({ description: "Resource updated." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "Membership not found." })
    @ApiConflictResponse({ description: "Member already active." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_UPDATED, message: MEMBERSHIP_MESSAGES.REACTIVATED })
    @Throttle({ default: { limit: 20, ttl: 900000 } })
    @Permissions("ADMIN_MEMBERSHIP_REACTIVATE")
    @HttpCode(HttpStatus.OK)
    @Patch(":id/reactivate")
    public async reactivate(
        @Param(new ZodValidationPipe(reactivateMemberParamsSchema)) params: ReactivateMemberParamsDto,
    ): Promise<ReactivateMemberResponseDto> {
        const output = await this.reactivateMemberUseCase.execute({
            membershipId: params.id,
        });
        return { id: output.id };
    }

    @ApiOperation({
        summary: "Revoke member",
        description: "Revokes a member's access to the active company (→ REVOKED).",
    })
    @ApiContract(RevokeMemberResponseDto)
    @ApiOkResponse({ description: "Resource updated." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "Membership not found." })
    @ApiConflictResponse({ description: "Member already revoked." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_UPDATED, message: MEMBERSHIP_MESSAGES.REVOKED })
    @Throttle({ default: { limit: 5, ttl: 900000 } })
    @Permissions("ADMIN_MEMBERSHIP_REVOKE")
    @HttpCode(HttpStatus.OK)
    @Patch(":id/revoke")
    public async revoke(
        @CurrentUser("userId") userId: string,
        @Param(new ZodValidationPipe(revokeMemberParamsSchema)) params: RevokeMemberParamsDto,
    ): Promise<RevokeMemberResponseDto> {
        const output = await this.revokeMemberUseCase.execute({
            actorUserId: userId,
            membershipId: params.id,
        });
        return { id: output.id };
    }
}
