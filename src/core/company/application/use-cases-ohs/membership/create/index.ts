import { Injectable } from "@nestjs/common";

import { IdGenerator } from "@/shared/id-generator";

import { Membership } from "../../../../domain/entities";
import { CompanyNotFoundError, MembershipAlreadyExistsError } from "../../../../domain/errors";
import { CompanyRepository, MembershipRepository } from "../../../../domain/interfaces";
import { CreateMembershipOhsInput } from "./input";
import { CreateMembershipOhsOutput } from "./output";

@Injectable()
export class CreateMembershipOhsUseCase {
    constructor(
        private readonly idGenerator: IdGenerator,
        private readonly companyRepository: CompanyRepository,
        private readonly membershipRepository: MembershipRepository,
    ) {}

    public async execute(input: CreateMembershipOhsInput): Promise<CreateMembershipOhsOutput> {
        const company = await this.companyRepository.findById(input.companyId);
        if (!company) {
            throw new CompanyNotFoundError();
        }
        if (company.tenantId !== input.tenantId) {
            throw new CompanyNotFoundError();
        }
        const existing = await this.membershipRepository.findByUserAndCompany(input.userId, input.companyId);
        if (existing && (existing.isPending() || existing.isActive())) {
            throw new MembershipAlreadyExistsError();
        }
        const now = new Date();
        const membership = Membership.createActive({
            id: this.idGenerator.generate(),
            tenantId: company.tenantId,
            userId: input.userId,
            companyId: input.companyId,
            roleId: input.roleId,
            createdAt: now,
            expiresAt: null,
        });
        await this.membershipRepository.create(membership);
        return { id: membership.id };
    }
}
