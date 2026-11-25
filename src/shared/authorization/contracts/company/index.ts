export abstract class CompanyChecker {
    public abstract isActive(companyId: string): Promise<boolean>;
}
