import { Body, Controller, Get, HttpStatus, Post, Query } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";

import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/zod";

import { GetAccountByEmailUseCase, GetAccountByUserIdUseCase, RegisterUseCase } from "../../../application/use-cases";
import { type AuthenticationAccount } from "../../../domain/entities";
import {
    GetAccountQueryDto,
    GetAccountResponseDto,
    RegisterAccountRequestDto,
    RegisterAccountResultDto,
} from "../../dto";
import { ACCOUNT_MESSAGES } from "../../messages";
import { getAccountQuerySchema, registerAccountSchema } from "../../schemas";

@ApiTags("Accounts")
@Controller("auth/accounts")
export class AccountController {
    constructor(
        private readonly getAccountByEmailUseCase: GetAccountByEmailUseCase,
        private readonly getAccountByUserIdUseCase: GetAccountByUserIdUseCase,
        private readonly registerUseCase: RegisterUseCase,
    ) {}

    @ApiOperation({
        summary: "Register account",
        description: "Creates a new authentication account for a user.",
    })
    @ApiContract(RegisterAccountResultDto, {
        status: HttpStatus.CREATED,
    })
    @ApiCreatedResponse({
        description: "Account registered successfully.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_CREATED,
        message: ACCOUNT_MESSAGES.CREATED,
    })
    @Post()
    public async register(
        @Body(new ZodValidationPipe(registerAccountSchema))
        body: RegisterAccountRequestDto,
    ): Promise<RegisterAccountResultDto> {
        const result = await this.registerUseCase.execute({
            invitationToken: body.invitationToken,
            provider: body.provider,
            email: body.email,
            credentials: { password: body.password },
            firstName: body.firstName,
            lastName: body.lastName,
        });
        return { accountId: result.accountId };
    }

    @ApiOperation({
        summary: "Get account",
        description: "Retrieves an authentication account by userId or email.",
    })
    @ApiContract(GetAccountResponseDto)
    @ApiOkResponse({
        description: "Account retrieved successfully.",
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
    @Response({
        code: RESPONSE_CODES.RESOURCE_FOUND,
        message: ACCOUNT_MESSAGES.RETRIEVED,
    })
    @Get()
    public async getAccount(
        @Query(new ZodValidationPipe(getAccountQuerySchema))
        query: GetAccountQueryDto,
    ): Promise<GetAccountResponseDto> {
        let account: AuthenticationAccount;
        if (query.userId) {
            account = await this.getAccountByUserIdUseCase.execute(query.userId);
        } else {
            account = await this.getAccountByEmailUseCase.execute(query.email!);
        }
        return {
            id: account.id,
            userId: account.userId,
            provider: account.provider,
            email: account.email,
            emailVerified: account.emailVerified,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        };
    }
}
