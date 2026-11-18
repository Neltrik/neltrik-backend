import { type TransactionContext } from "@/shared/transaction";

import { type Membership } from "../../domain/entities";
import { MembershipRepository } from "../../domain/interfaces";
import { type FindByCompanyParams, type FindByUserParams } from "../../domain/types";

export class MembershipRepositorySpy extends MembershipRepository {
    public create = jest.fn<Promise<Membership>, [Membership, TransactionContext?]>();
    public findById = jest.fn<Promise<Membership | null>, [string]>();
    public findByUserAndCompany = jest.fn<Promise<Membership | null>, [string, string]>();
    public findActiveByUserAndCompany = jest.fn<Promise<Membership | null>, [string, string]>();
    public findByCompany = jest.fn<Promise<Membership[]>, [FindByCompanyParams]>();
    public update = jest.fn<Promise<void>, [Membership]>();
    public findByUser = jest.fn<Promise<Membership[]>, [FindByUserParams]>();
}
