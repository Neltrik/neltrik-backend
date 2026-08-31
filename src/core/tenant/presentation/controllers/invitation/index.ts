import { Body, Controller, Get, HttpStatus, Param, Post, Query } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { Public, TenantId } from "@/shared/auth";
import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/pipes/zod-validation";

import {
    CreateInvitationUseCase,
    ListInvitationsByTenantUseCase,
    RevokeInvitationUseCase,
    ValidateInvitationUseCase,
} from "../../../application/use-cases";
import {
    CreateInvitationRequestDto,
    CreateInvitationResultDto,
    ListInvitationsParamsDto,
    ListInvitationsResultDto,
    RevokeInvitationParamsDto,
    RevokeInvitationResultDto,
    ValidateInvitationQueryDto,
    ValidateInvitationResultDto,
} from "../../dto";
import { INVITATION_MESSAGES } from "../../messages";
import {
    createInvitationSchema,
    listInvitationsParamsSchema,
    revokeInvitationParamsSchema,
    validateInvitationQuerySchema,
} from "../../schemas";

@ApiTags("Invitations")
@Controller("invitations")
export class InvitationController {
    constructor(
        private readonly createInvitationUseCase: CreateInvitationUseCase,
        private readonly validateInvitationUseCase: ValidateInvitationUseCase,
        private readonly revokeInvitationUseCase: RevokeInvitationUseCase,
        private readonly listInvitationsByTenantUseCase: ListInvitationsByTenantUseCase,
    ) {}

    @ApiOperation({
        summary: "Create invitation",
        description: "Creates a new invitation for a user to join a tenant.",
    })
    @ApiContract(CreateInvitationResultDto, { status: HttpStatus.CREATED })
    @ApiCreatedResponse({
        description: "Invitation created successfully.",
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
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_CREATED,
        message: INVITATION_MESSAGES.CREATED,
    })
    @Post()
    public async create(
        @TenantId() tenantId: string,
        @Body(new ZodValidationPipe(createInvitationSchema))
        body: CreateInvitationRequestDto,
    ): Promise<CreateInvitationResultDto> {
        const result = await this.createInvitationUseCase.execute({
            tenantId,
            roleId: body.roleId,
            recipient: body.recipient,
            mechanism: body.mechanism,
        });
        return { invitationId: result.invitationId, magicLink: result.magicLink };
    }

    @ApiOperation({
        summary: "Validate invitation",
        description: "Validates if an invitation token is valid (without consuming it).",
    })
    @ApiContract(ValidateInvitationResultDto)
    @ApiOkResponse({
        description: "Invitation is valid.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiNotFoundResponse({
        description: "Invitation not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_FOUND,
        message: INVITATION_MESSAGES.VALIDATED,
    })
    @Public()
    @Get("validate")
    public async validate(
        @Query(new ZodValidationPipe(validateInvitationQuerySchema))
        query: ValidateInvitationQueryDto,
    ): Promise<ValidateInvitationResultDto> {
        const result = await this.validateInvitationUseCase.execute(query.token);
        return {
            invitationId: result.invitationId,
            tenantId: result.tenantId,
            roleId: result.roleId,
            recipient: result.recipient,
        };
    }

    @ApiOperation({
        summary: "Revoke invitation",
        description: "Revokes a pending invitation.",
    })
    @ApiContract(RevokeInvitationResultDto)
    @ApiOkResponse({
        description: "Invitation revoked successfully.",
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
        description: "Invitation not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: INVITATION_MESSAGES.REVOKED,
    })
    @Get(":token/revoke")
    public async revoke(
        @Param(new ZodValidationPipe(revokeInvitationParamsSchema))
        params: RevokeInvitationParamsDto,
    ): Promise<RevokeInvitationResultDto> {
        const result = await this.revokeInvitationUseCase.execute(params.token);
        return {
            invitationId: result.invitationId,
            status: result.status,
            revokedAt: result.revokedAt,
        };
    }

    @ApiOperation({
        summary: "List invitations by tenant",
        description: "Lists all invitations for a specific tenant.",
    })
    @ApiContract(ListInvitationsResultDto)
    @ApiOkResponse({
        description: "Invitations retrieved successfully.",
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
        description: "Tenant not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_FOUND,
        message: INVITATION_MESSAGES.RETRIEVED,
    })
    @Get("tenant/:tenantId")
    public async listByTenant(
        @Param(new ZodValidationPipe(listInvitationsParamsSchema))
        params: ListInvitationsParamsDto,
    ): Promise<ListInvitationsResultDto> {
        const invitations = await this.listInvitationsByTenantUseCase.execute(params.tenantId);
        return {
            items: invitations.map((invitation) => ({
                id: invitation.id,
                roleId: invitation.roleId,
                recipient: invitation.recipient.value,
                mechanism: invitation.mechanism,
                status: invitation.status,
                expiresAt: invitation.expirationDate.value,
                createdAt: invitation.createdAt,
                updatedAt: invitation.updatedAt,
                usedAt: invitation.usedAt,
                revokedAt: invitation.revokedAt,
                token: invitation.token.value,
            })),
        };
    }
}
