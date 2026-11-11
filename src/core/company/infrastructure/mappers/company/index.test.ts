import type { Company as PrismaCompany } from "@prisma/client";

import { Company } from "../../../domain/entities";
import { COMPANY_STATUS, type CompanyProps } from "../../../domain/types";
import { CompanyMapper } from "./index";

const createProps = (): CompanyProps => {
    const createdAt = new Date("2026-01-15T10:30:00.000Z");
    const updatedAt = new Date("2026-01-15T11:30:00.000Z");
    return {
        id: "company-id",
        tenantId: "tenant-id",
        name: "Mi Empresa",
        slug: "mi-empresa",
        status: COMPANY_STATUS.ACTIVE,
        createdAt,
        updatedAt,
    };
};

describe("CompanyMapper", () => {
    it("should map a domain company to persistence", () => {
        const company = Company.restore(createProps());
        const persistence = CompanyMapper.toPersistence(company);
        expect(persistence).toEqual({
            id: company.id,
            tenantId: company.tenantId,
            name: company.name,
            slug: company.slug,
            status: company.status,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt,
        });
    });

    it("should preserve all company properties when mapping to persistence", () => {
        const company = Company.restore(createProps());
        const persistence = CompanyMapper.toPersistence(company);
        expect(persistence.id).toBe(company.id);
        expect(persistence.tenantId).toBe(company.tenantId);
        expect(persistence.name).toBe(company.name);
        expect(persistence.slug).toBe(company.slug);
        expect(persistence.status).toBe(company.status);
    });

    it("should preserve dates when mapping a domain company to persistence", () => {
        const props = createProps();
        const company = Company.restore(props);
        const persistence = CompanyMapper.toPersistence(company);
        expect(persistence.createdAt).toBe(props.createdAt);
        expect(persistence.updatedAt).toBe(props.updatedAt);
    });

    it("should map a persistence company to domain", () => {
        const props = createProps();
        const persistence = {
            id: props.id,
            tenantId: props.tenantId,
            name: props.name,
            slug: props.slug,
            status: props.status,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
        const company = CompanyMapper.toDomain(persistence);
        expect(company).toBeInstanceOf(Company);
        expect(company.id).toBe(persistence.id);
        expect(company.tenantId).toBe(persistence.tenantId);
        expect(company.name).toBe(persistence.name);
        expect(company.slug).toBe(persistence.slug);
        expect(company.status).toBe(persistence.status);
        expect(company.createdAt).toEqual(persistence.createdAt);
        expect(company.updatedAt).toEqual(persistence.updatedAt);
    });

    it("should map persistence values correctly when mapping to domain", () => {
        const props = createProps();
        const persistence = {
            ...props,
            name: "Nueva Empresa",
            slug: "nueva-empresa",
            status: COMPANY_STATUS.SUSPENDED,
        } as PrismaCompany;
        const company = CompanyMapper.toDomain(persistence);
        expect(company.name).toBe("Nueva Empresa");
        expect(company.slug).toBe("nueva-empresa");
        expect(company.status).toBe(COMPANY_STATUS.SUSPENDED);
    });

    it("should preserve dates when mapping a persistence company to domain", () => {
        const props = createProps();
        const persistence = { ...props };
        const company = CompanyMapper.toDomain(persistence);
        expect(company.createdAt).toEqual(props.createdAt);
        expect(company.updatedAt).toEqual(props.updatedAt);
    });

    it("should map an active company from persistence to domain", () => {
        const persistence = { ...createProps(), status: COMPANY_STATUS.ACTIVE } as PrismaCompany;
        const company = CompanyMapper.toDomain(persistence);
        expect(company.isActive()).toBe(true);
        expect(company.isSuspended()).toBe(false);
    });

    it("should map a suspended company from persistence to domain", () => {
        const persistence = { ...createProps(), status: COMPANY_STATUS.SUSPENDED } as PrismaCompany;
        const company = CompanyMapper.toDomain(persistence);
        expect(company.isSuspended()).toBe(true);
        expect(company.isActive()).toBe(false);
    });
});
