import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/index";

import { Company } from "../../../domain/entities";
import { CompanyRepository } from "../../../domain/interfaces";
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
        const company = await this.prisma.tenantClient.company.findFirst({
            where: { id },
        });
        if (!company) {
            return null;
        }
        return CompanyMapper.toDomain(company);
    }

    public async findByTenant(tenantId: string): Promise<Company[]> {
        const companies = await this.prisma.tenantClient.company.findMany({
            where: { tenantId },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        });
        return companies.map((company) => CompanyMapper.toDomain(company));
    }

    public async findByTenantAndSlug(tenantId: string, slug: string): Promise<Company | null> {
        const company = await this.prisma.tenantClient.company.findFirst({
            where: { tenantId, slug },
        });
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
}
