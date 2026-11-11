import { type Company as PrismaCompany } from "@prisma/client";

import { Company } from "../../../domain/entities";

export class CompanyMapper {
    public static toPersistence(company: Company) {
        return {
            id: company.id,
            tenantId: company.tenantId,
            name: company.name,
            slug: company.slug,
            status: company.status,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt,
        };
    }

    public static toDomain(prismaCompany: PrismaCompany): Company {
        return Company.restore({
            id: prismaCompany.id,
            tenantId: prismaCompany.tenantId,
            name: prismaCompany.name,
            slug: prismaCompany.slug,
            status: prismaCompany.status,
            createdAt: prismaCompany.createdAt,
            updatedAt: prismaCompany.updatedAt,
        });
    }
}
