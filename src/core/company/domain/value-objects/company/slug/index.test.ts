import {
    CompanySlugTooLongError,
    CompanySlugTooShortError,
    EmptyCompanySlugError,
    InvalidCompanySlugFormatError,
} from "../../../errors";
import { CompanySlug } from "./index";

describe("CompanySlug", () => {
    describe("create", () => {
        it("should create a valid company slug", () => {
            const companySlug = CompanySlug.create("mi-empresa");
            expect(companySlug.value).toBe("mi-empresa");
        });

        it("should trim leading and trailing spaces", () => {
            const companySlug = CompanySlug.create("   mi-empresa   ");
            expect(companySlug.value).toBe("mi-empresa");
        });

        it("should convert uppercase letters to lowercase", () => {
            const companySlug = CompanySlug.create("MI-EMPRESA");
            expect(companySlug.value).toBe("mi-empresa");
        });

        it("should remove accents from characters", () => {
            const companySlug = CompanySlug.create("compañía");
            expect(companySlug.value).toBe("compania");
        });

        it("should replace spaces and special characters with hyphens", () => {
            const companySlug = CompanySlug.create("mi empresa @ 2026");
            expect(companySlug.value).toBe("mi-empresa-2026");
        });

        it("should remove consecutive hyphens", () => {
            const companySlug = CompanySlug.create("mi---empresa");
            expect(companySlug.value).toBe("mi-empresa");
        });

        it("should remove leading and trailing hyphens", () => {
            const companySlug = CompanySlug.create("---mi-empresa---");
            expect(companySlug.value).toBe("mi-empresa");
        });

        it("should throw EmptyCompanySlugError when company slug is empty", () => {
            expect(() => CompanySlug.create("")).toThrow(EmptyCompanySlugError);
        });

        it("should throw EmptyCompanySlugError when company slug contains only spaces", () => {
            expect(() => CompanySlug.create("     ")).toThrow(EmptyCompanySlugError);
        });

        it("should throw CompanySlugTooShortError when company slug has less than 3 characters", () => {
            expect(() => CompanySlug.create("ab")).toThrow(CompanySlugTooShortError);
        });

        it("should throw CompanySlugTooLongError when company slug exceeds 50 characters", () => {
            const longCompanySlug = "a".repeat(51);
            expect(() => CompanySlug.create(longCompanySlug)).toThrow(CompanySlugTooLongError);
        });

        it("should create a company slug with exactly 3 characters", () => {
            const companySlug = CompanySlug.create("abc");
            expect(companySlug.value).toBe("abc");
        });

        it("should create a company slug with exactly 50 characters", () => {
            const validCompanySlug = "a".repeat(50);
            const companySlug = CompanySlug.create(validCompanySlug);
            expect(companySlug.value).toBe(validCompanySlug);
        });
    });

    describe("restore", () => {
        it("should restore a valid company slug", () => {
            const companySlug = CompanySlug.restore("mi-empresa");
            expect(companySlug.value).toBe("mi-empresa");
        });

        it("should throw EmptyCompanySlugError when company slug is empty", () => {
            expect(() => CompanySlug.restore("")).toThrow(EmptyCompanySlugError);
        });

        it("should throw CompanySlugTooShortError when company slug has less than 3 characters", () => {
            expect(() => CompanySlug.restore("ab")).toThrow(CompanySlugTooShortError);
        });

        it("should throw CompanySlugTooLongError when company slug exceeds 50 characters", () => {
            const longCompanySlug = "a".repeat(51);
            expect(() => CompanySlug.restore(longCompanySlug)).toThrow(CompanySlugTooLongError);
        });

        it("should throw InvalidCompanySlugFormatError when company slug contains uppercase letters", () => {
            expect(() => CompanySlug.restore("Mi-Empresa")).toThrow(InvalidCompanySlugFormatError);
        });

        it("should throw InvalidCompanySlugFormatError when company slug contains spaces", () => {
            expect(() => CompanySlug.restore("mi empresa")).toThrow(InvalidCompanySlugFormatError);
        });

        it("should throw InvalidCompanySlugFormatError when company slug starts with a hyphen", () => {
            expect(() => CompanySlug.restore("-mi-empresa")).toThrow(InvalidCompanySlugFormatError);
        });

        it("should throw InvalidCompanySlugFormatError when company slug ends with a hyphen", () => {
            expect(() => CompanySlug.restore("mi-empresa-")).toThrow(InvalidCompanySlugFormatError);
        });

        it("should throw InvalidCompanySlugFormatError when company slug contains consecutive hyphens", () => {
            expect(() => CompanySlug.restore("mi--empresa")).toThrow(InvalidCompanySlugFormatError);
        });

        it("should throw InvalidCompanySlugFormatError when company slug contains special characters", () => {
            expect(() => CompanySlug.restore("mi_empresa")).toThrow(InvalidCompanySlugFormatError);
        });
    });

    describe("equals", () => {
        it("should return true when comparing equal company slugs", () => {
            const companySlug1 = CompanySlug.create("mi-empresa");
            const companySlug2 = CompanySlug.create("mi-empresa");
            expect(companySlug1.equals(companySlug2)).toBe(true);
        });

        it("should return false when comparing different company slugs", () => {
            const companySlug1 = CompanySlug.create("mi-empresa");
            const companySlug2 = CompanySlug.create("otra-empresa");
            expect(companySlug1.equals(companySlug2)).toBe(false);
        });
    });
});
