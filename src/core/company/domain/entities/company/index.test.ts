import {
    CompanyAlreadyActiveError,
    CompanyAlreadySuspendedError,
    InvalidCompanyNameError,
    InvalidCompanyStatusError,
} from "../../errors";
import { COMPANY_STATUS, type CompanyProps, type CompanyStatus } from "../../types";
import { Company } from "./index";

const createProps = (): CompanyProps => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "company-id",
        tenantId: "tenant-id",
        name: "Mi Empresa",
        slug: "mi-empresa",
        status: COMPANY_STATUS.ACTIVE,
        createdAt,
        updatedAt: createdAt,
    };
};

describe("Company", () => {
    it("should create a company", () => {
        const props = createProps();
        const { status: _status, updatedAt: _updatedAt, ...restProps } = props;
        const company = Company.create(restProps);
        expect(company.id).toBe(props.id);
        expect(company.tenantId).toBe(props.tenantId);
        expect(company.name).toBe(props.name);
        expect(company.slug).toBe(props.slug);
        expect(company.status).toBe(COMPANY_STATUS.ACTIVE);
        expect(company.createdAt).toBe(props.createdAt);
        expect(company.updatedAt).toBe(props.createdAt);
    });

    it("should restore a company", () => {
        const props = createProps();
        const company = Company.restore(props);
        expect(company.id).toBe(props.id);
        expect(company.tenantId).toBe(props.tenantId);
        expect(company.name).toBe(props.name);
        expect(company.slug).toBe(props.slug);
        expect(company.status).toBe(props.status);
        expect(company.createdAt).toBe(props.createdAt);
        expect(company.updatedAt).toBe(props.updatedAt);
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const company = Company.restore(props);
        expect(company.id).toBe(props.id);
        expect(company.tenantId).toBe(props.tenantId);
        expect(company.name).toBe(props.name);
        expect(company.slug).toBe(props.slug);
        expect(company.status).toBe(props.status);
        expect(company.createdAt).toBe(props.createdAt);
        expect(company.updatedAt).toBe(props.updatedAt);
    });
});

describe("Validations", () => {
    it("should throw InvalidCompanyNameError when name is empty", () => {
        const props = createProps();
        expect(() => Company.restore({ ...props, name: "" })).toThrow(InvalidCompanyNameError);
    });

    it("should throw InvalidCompanyNameError when name contains only spaces", () => {
        const props = createProps();
        expect(() => Company.restore({ ...props, name: "     " })).toThrow(InvalidCompanyNameError);
    });

    it("should throw InvalidCompanyNameError when name exceeds 255 characters", () => {
        const props = createProps();
        const longName = "A".repeat(256);
        expect(() => Company.restore({ ...props, name: longName })).toThrow(InvalidCompanyNameError);
    });

    it("should accept a company name with exactly 255 characters", () => {
        const props = createProps();
        const validName = "A".repeat(255);
        const company = Company.restore({ ...props, name: validName });
        expect(company.name).toBe(validName);
    });

    it("should throw InvalidCompanyStatusError when status is invalid", () => {
        const props = createProps();
        const invalidStatus = "INVALID_STATUS" as unknown as CompanyStatus;
        expect(() => Company.restore({ ...props, status: invalidStatus })).toThrow(InvalidCompanyStatusError);
    });
});

describe("Mutations & State Transitions", () => {
    it("should suspend an active company", () => {
        const company = Company.restore(createProps());
        const previousUpdatedAt = company.updatedAt;
        company.suspend();
        expect(company.status).toBe(COMPANY_STATUS.SUSPENDED);
        expect(company.updatedAt).toBeInstanceOf(Date);
        expect(company.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
    });

    it("should throw CompanyAlreadySuspendedError when suspending an already suspended company", () => {
        const company = Company.restore({ ...createProps(), status: COMPANY_STATUS.SUSPENDED });
        expect(() => company.suspend()).toThrow(CompanyAlreadySuspendedError);
    });

    it("should reactivate a suspended company", () => {
        const company = Company.restore({ ...createProps(), status: COMPANY_STATUS.SUSPENDED });
        const previousUpdatedAt = company.updatedAt;
        company.reactivate();
        expect(company.status).toBe(COMPANY_STATUS.ACTIVE);
        expect(company.updatedAt).toBeInstanceOf(Date);
        expect(company.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
    });

    it("should throw CompanyAlreadyActiveError when reactivating an already active company", () => {
        const company = Company.restore({ ...createProps(), status: COMPANY_STATUS.ACTIVE });
        expect(() => company.reactivate()).toThrow(CompanyAlreadyActiveError);
    });

    it("should rename a company", () => {
        const company = Company.restore(createProps());
        const previousUpdatedAt = company.updatedAt;
        company.rename("Nueva Empresa");
        expect(company.name).toBe("Nueva Empresa");
        expect(company.updatedAt).toBeInstanceOf(Date);
        expect(company.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
    });

    it("should throw InvalidCompanyNameError when renaming with an empty name", () => {
        const company = Company.restore(createProps());
        expect(() => company.rename("")).toThrow(InvalidCompanyNameError);
    });

    it("should throw InvalidCompanyNameError when renaming with only spaces", () => {
        const company = Company.restore(createProps());
        expect(() => company.rename("     ")).toThrow(InvalidCompanyNameError);
    });

    it("should throw InvalidCompanyNameError when renaming with a name exceeding 255 characters", () => {
        const company = Company.restore(createProps());
        const longName = "A".repeat(256);
        expect(() => company.rename(longName)).toThrow(InvalidCompanyNameError);
    });

    it("should change company slug", () => {
        const company = Company.restore(createProps());
        const previousUpdatedAt = company.updatedAt;
        company.changeSlug("Nueva Empresa");
        expect(company.slug).toBe("nueva-empresa");
        expect(company.updatedAt).toBeInstanceOf(Date);
        expect(company.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
    });

    it("should normalize company slug when changing it", () => {
        const company = Company.restore(createProps());
        company.changeSlug("  MI COMPAÑÍA  ");
        expect(company.slug).toBe("mi-compania");
    });
});

describe("Company helpers", () => {
    it("should return true when company is active", () => {
        const company = Company.restore({ ...createProps(), status: COMPANY_STATUS.ACTIVE });
        expect(company.isActive()).toBe(true);
        expect(company.isSuspended()).toBe(false);
    });

    it("should return true when company is suspended", () => {
        const company = Company.restore({ ...createProps(), status: COMPANY_STATUS.SUSPENDED });
        expect(company.isSuspended()).toBe(true);
        expect(company.isActive()).toBe(false);
    });

    it("should return true when active company can be suspended", () => {
        const company = Company.restore({ ...createProps(), status: COMPANY_STATUS.ACTIVE });
        expect(company.canBeSuspended()).toBe(true);
        expect(company.canBeReactivated()).toBe(false);
    });

    it("should return true when suspended company can be reactivated", () => {
        const company = Company.restore({ ...createProps(), status: COMPANY_STATUS.SUSPENDED });
        expect(company.canBeReactivated()).toBe(true);
        expect(company.canBeSuspended()).toBe(false);
    });
});
