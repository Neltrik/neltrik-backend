import {
    CompanySlugTooLongError,
    CompanySlugTooShortError,
    EmptyCompanySlugError,
    InvalidCompanySlugFormatError,
} from "../../../errors";

export class CompanySlug {
    private static readonly MIN_LENGTH = 3;
    private static readonly MAX_LENGTH = 50;
    private static readonly FORMAT_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    private constructor(private readonly companySlug: string) {}

    public static create(value: string): CompanySlug {
        const normalizedValue = CompanySlug.normalize(value);
        CompanySlug.ensureIsNotEmpty(normalizedValue);
        CompanySlug.ensureMinLength(normalizedValue);
        CompanySlug.ensureMaxLength(normalizedValue);
        CompanySlug.ensureFormat(normalizedValue);
        return new CompanySlug(normalizedValue);
    }

    public static restore(value: string): CompanySlug {
        CompanySlug.ensureIsNotEmpty(value);
        CompanySlug.ensureMinLength(value);
        CompanySlug.ensureMaxLength(value);
        CompanySlug.ensureFormat(value);
        return new CompanySlug(value);
    }

    private static normalize(value: string): string {
        return value
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .replace(/-+/g, "-");
    }

    private static ensureIsNotEmpty(value: string): void {
        if (value === "") {
            throw new EmptyCompanySlugError();
        }
    }

    private static ensureMinLength(value: string): void {
        if (value.length < CompanySlug.MIN_LENGTH) {
            throw new CompanySlugTooShortError();
        }
    }

    private static ensureMaxLength(value: string): void {
        if (value.length > CompanySlug.MAX_LENGTH) {
            throw new CompanySlugTooLongError();
        }
    }

    private static ensureFormat(value: string): void {
        if (!CompanySlug.FORMAT_REGEX.test(value)) {
            throw new InvalidCompanySlugFormatError();
        }
    }

    public get value(): string {
        return this.companySlug;
    }

    public equals(other: CompanySlug): boolean {
        return this.companySlug === other.companySlug;
    }
}
