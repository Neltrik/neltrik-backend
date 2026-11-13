import type { Membership } from "../../entities";
import type { FindByCompanyParams, FindByUserParams } from "../../types";

export abstract class MembershipRepository {
    abstract create(membership: Membership): Promise<Membership>;
    abstract findById(id: string): Promise<Membership | null>;
    abstract findByUserAndCompany(userId: string, companyId: string): Promise<Membership | null>;
    abstract findActiveByUserAndCompany(userId: string, companyId: string): Promise<Membership | null>;
    abstract findByCompany(params: FindByCompanyParams): Promise<Membership[]>;
    abstract update(membership: Membership): Promise<void>;
    abstract findByUser(params: FindByUserParams): Promise<Membership[]>;
}
