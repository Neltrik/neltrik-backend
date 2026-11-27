import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/index";
import { PaginationInput, withPaginationArgs } from "@/shared/pagination";

import { Company } from "../../../domain/entities";
import { CompanyRepository } from "../../../domain/interfaces";
import { FindByUserMembershipParams } from "../../../domain/types";
import { CompanyMapper } from "../../mappers";

@Injectable()
export class PrismaCompanyRepository extends CompanyRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(company: Company): Promise<Company> {
        const persistence = await this.prisma.tenantClient.company.create({
            data: CompanyMapper.toPersistence(company),
        });
        return CompanyMapper.toDomain(persistence);
    }

    public async findById(id: string): Promise<Company | null> {
        if (!id) {
            return null;
        }
        const company = await this.prisma.tenantClient.company.findFirst({
            where: { id },
        });
        if (!company) {
            return null;
        }
        return CompanyMapper.toDomain(company);
    }

    public async findBySlug(slug: string): Promise<Company | null> {
        const company = await this.prisma.tenantClient.company.findFirst({ where: { slug } });
        if (!company) {
            return null;
        }
        return CompanyMapper.toDomain(company);
    }

    public async update(company: Company): Promise<void> {
        await this.prisma.tenantClient.company.update({
            where: { id: company.id },
            data: CompanyMapper.toPersistence(company),
        });
    }

    public async delete(id: string): Promise<void> {
        await this.prisma.tenantClient.company.delete({ where: { id } });
    }

    public async findAll(params: PaginationInput): Promise<Company[]> {
        const companies = await this.prisma.tenantClient.company.findMany({
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            ...withPaginationArgs({ cursor: params.cursor, limit: params.limit }),
        });
        return companies.map((company) => CompanyMapper.toDomain(company));
    }

    public async findByUserMembership(params: FindByUserMembershipParams): Promise<Company[]> {
        const companies = await this.prisma.tenantClient.company.findMany({
            where: { memberships: { some: { userId: params.userId, status: "ACTIVE" } } },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            ...withPaginationArgs({ cursor: params.cursor, limit: params.limit }),
        });
        return companies.map((company) => CompanyMapper.toDomain(company));
    }
}
