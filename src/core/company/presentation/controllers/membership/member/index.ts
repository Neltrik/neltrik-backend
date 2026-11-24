import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Param, Patch, Query } from "@nestjs/common";
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
import { Permissions, PublicPermission, WithoutCompany } from "@/shared/authorization";
import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ResponsePayload } from "@/shared/pagination";
import { ZodValidationPipe } from "@/shared/zod";

import {
    GetMembershipUseCase,
    ListMembersUseCase,
    ListMyMembershipsUseCase,
    UpdateMemberRoleUseCase,
} from "../../../../application/use-cases";
import {
    GetMembershipParamsDto,
    GetMembershipResponseDto,
    ListMembersQueryDto,
    ListMyMembershipsQueryDto,
    MembershipResponseDto,
    UpdateMemberRoleParamsDto,
    UpdateMemberRoleRequestDto,
    UpdateMemberRoleResponseDto,
} from "../../../dto";
import { MembershipMapper } from "../../../mappers";
import { MEMBERSHIP_MESSAGES } from "../../../messages";
import {
    getMembershipParamsSchema,
    listMembersQuerySchema,
    listMyMembershipsQuerySchema,
    updateMemberRoleParamsSchema,
    updateMemberRoleSchema,
} from "../../../schemas";

@ApiTags("Memberships")
@Controller("memberships")
export class MemberController {
    constructor(
        private readonly getMembershipUseCase: GetMembershipUseCase,
        private readonly listMembersUseCase: ListMembersUseCase,
        private readonly listMyMembershipsUseCase: ListMyMembershipsUseCase,
        private readonly updateMemberRoleUseCase: UpdateMemberRoleUseCase,
    ) {}

    @ApiOperation({
        summary: "List my memberships",
        description: "Lists every membership of the authenticated user across all companies.",
    })
    @ApiContract(MembershipResponseDto, { responseType: "array" })
    @ApiOkResponse({ description: "Resource found." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_FOUND, message: MEMBERSHIP_MESSAGES.LISTED_MY })
    @WithoutCompany()
    @PublicPermission()
    @Get("mine")
    public async listMine(
        @CurrentUser("userId") userId: string,
        @Query(new ZodValidationPipe(listMyMembershipsQuerySchema)) query: ListMyMembershipsQueryDto,
    ): Promise<ResponsePayload<MembershipResponseDto[]>> {
        const { memberships, meta } = await this.listMyMembershipsUseCase.execute({
            actorUserId: userId,
            status: query.status,
            limit: query.limit,
            cursor: query.cursor,
        });
        return MembershipMapper.toResponse({ data: memberships, meta });
    }

    @ApiOperation({
        summary: "List members",
        description: "Lists the members of the active company with cursor pagination.",
    })
    @ApiContract(MembershipResponseDto, { responseType: "array" })
    @ApiOkResponse({ description: "Resource found." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_FOUND, message: MEMBERSHIP_MESSAGES.LISTED })
    @Permissions("ADMIN_MEMBERSHIP_LIST")
    @Get()
    public async list(
        @Headers("x-company-id") companyId: string,
        @Query(new ZodValidationPipe(listMembersQuerySchema)) query: ListMembersQueryDto,
    ): Promise<ResponsePayload<MembershipResponseDto[]>> {
        const { memberships, meta } = await this.listMembersUseCase.execute({
            companyId,
            cursor: query.cursor,
            limit: query.limit,
        });
        return MembershipMapper.toResponse({ data: memberships, meta });
    }

    @ApiOperation({
        summary: "Get membership",
        description: "Gets a membership of the active company by its identifier.",
    })
    @ApiContract(GetMembershipResponseDto)
    @ApiOkResponse({ description: "Resource found." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "Membership not found." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_FOUND, message: MEMBERSHIP_MESSAGES.RETRIEVED })
    @Permissions("ADMIN_MEMBERSHIP_READ")
    @Get(":id")
    public async get(
        @CurrentUser("tenantId") tenantId: string,
        @CurrentUser("userId") userId: string,
        @Param(new ZodValidationPipe(getMembershipParamsSchema)) params: GetMembershipParamsDto,
    ): Promise<GetMembershipResponseDto> {
        const { membership } = await this.getMembershipUseCase.execute({
            actorTenantId: tenantId,
            actorUserId: userId,
            membershipId: params.id,
        });
        return {
            id: membership.id,
            userId: membership.userId,
            companyId: membership.companyId,
            roleId: membership.roleId,
            status: membership.status,
            createdAt: membership.createdAt,
            updatedAt: membership.updatedAt,
            expiresAt: membership.expiresAt,
        };
    }

    @ApiOperation({
        summary: "Update member role",
        description: "Changes the role assigned to a member of the active company.",
    })
    @ApiContract(UpdateMemberRoleResponseDto)
    @ApiOkResponse({ description: "Resource updated." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "Membership or role not found." })
    @ApiConflictResponse({ description: "Member already has that role." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_UPDATED, message: MEMBERSHIP_MESSAGES.ROLE_UPDATED })
    @Throttle({ default: { limit: 20, ttl: 900000 } })
    @Permissions("ADMIN_MEMBERSHIP_UPDATE_ROLE")
    @HttpCode(HttpStatus.OK)
    @Patch(":id/role")
    public async updateRole(
        @CurrentUser("tenantId") tenantId: string,
        @CurrentUser("userId") userId: string,
        @Param(new ZodValidationPipe(updateMemberRoleParamsSchema)) params: UpdateMemberRoleParamsDto,
        @Body(new ZodValidationPipe(updateMemberRoleSchema)) body: UpdateMemberRoleRequestDto,
    ): Promise<UpdateMemberRoleResponseDto> {
        const output = await this.updateMemberRoleUseCase.execute({
            actorTenantId: tenantId,
            actorUserId: userId,
            membershipId: params.id,
            roleId: body.roleId,
        });
        return { id: output.id };
    }
}
