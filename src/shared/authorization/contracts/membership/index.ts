export abstract class MembershipChecker {
    public abstract hasActiveMembership(userId: string, companyId: string): Promise<boolean>;
}
