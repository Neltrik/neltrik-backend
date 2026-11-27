import { Injectable } from "@nestjs/common";

import { AuthorizationRoleApi } from "@/core/authorization/api";
import { CompanyApi, MembershipApi } from "@/core/company/api";
import { UserApi } from "@/core/identity/api";
import { IdGenerator } from "@/shared/id-generator";
import { SagaOrchestrator, type SagaStep } from "@/shared/saga";

import { Tenant } from "../../../../domain/entities";
import { TenantRepository } from "../../../../domain/interfaces";
import { SlugGenerator } from "../../../slug-generator";
import { type CreateTenantInput } from "./input";
import { type CreateTenantOutput } from "./output";
import type { CreateTenantSagaContext } from "./types";

@Injectable()
export class CreateTenantUseCase {
    constructor(
        private readonly authorizationRoleApi: AuthorizationRoleApi,
        private readonly companyApi: CompanyApi,
        private readonly membershipApi: MembershipApi,
        private readonly userApi: UserApi,
        private readonly idGenerator: IdGenerator,
        private readonly tenantRepository: TenantRepository,
        private readonly slugGenerator: SlugGenerator,
    ) {}

    public async execute(input: CreateTenantInput): Promise<CreateTenantOutput> {
        await this.authorizationRoleApi.validate(input.ownerRoleId);
        const tenantId = this.idGenerator.generate();
        const now = new Date();
        const steps = [
            this.createTenantStep(input, tenantId, now),
            this.createUserStep(input, tenantId),
            this.createCompanyStep(input, tenantId),
            this.createMembershipStep(input, tenantId),
        ];
        await SagaOrchestrator.execute<CreateTenantSagaContext>(steps, {});
        return { id: tenantId };
    }

    private createTenantStep(input: CreateTenantInput, tenantId: string, now: Date): SagaStep<CreateTenantSagaContext> {
        return {
            execute: async (context) => {
                const slug = this.slugGenerator.generate(input.name, tenantId);
                const tenant = Tenant.create({
                    id: tenantId,
                    name: input.name,
                    slug,
                    type: input.type,
                    createdAt: now,
                    updatedAt: now,
                    suspendedAt: null,
                });
                await this.tenantRepository.create(tenant);
                context.tenantId = tenantId;
            },
            compensate: async (context) => {
                if (context.tenantId) {
                    await this.tenantRepository.delete(context.tenantId);
                }
            },
        };
    }

    private createUserStep(input: CreateTenantInput, tenantId: string): SagaStep<CreateTenantSagaContext> {
        return {
            execute: async (context) => {
                const user = await this.userApi.create({
                    email: input.ownerEmail,
                    firstName: input.ownerFirstName,
                    lastName: input.ownerLastName,
                    tenantId,
                });
                context.userId = user.id;
            },
            compensate: async (context) => {
                if (context.userId) {
                    await this.userApi.delete(context.userId);
                }
            },
        };
    }

    private createCompanyStep(input: CreateTenantInput, tenantId: string): SagaStep<CreateTenantSagaContext> {
        return {
            execute: async (context) => {
                const companySlug = this.slugGenerator.generate(input.name, `${tenantId}-default`);
                const company = await this.companyApi.create({ tenantId, name: input.name, slug: companySlug });
                context.companyId = company.id;
            },
            compensate: async (context) => {
                if (context.companyId) {
                    await this.companyApi.delete(context.companyId);
                }
            },
        };
    }

    private createMembershipStep(input: CreateTenantInput, tenantId: string): SagaStep<CreateTenantSagaContext> {
        return {
            execute: async (context) => {
                await this.membershipApi.create({
                    companyId: context.companyId!,
                    roleId: input.ownerRoleId,
                    tenantId,
                    userId: context.userId!,
                });
            },
        };
    }
}

export type { CreateTenantInput };
