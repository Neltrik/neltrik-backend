import { type Invitation } from "../../domain/entities";
import { InvitationRepository } from "../../domain/interfaces";

export class InvitationRepositorySpy extends InvitationRepository {
    public create = jest.fn<Promise<void>, [Invitation]>();
    public update = jest.fn<Promise<void>, [Invitation]>();
    public getByToken = jest.fn<Promise<Invitation | null>, [string]>();
    public listByTenant = jest.fn<Promise<Invitation[]>, [string]>();
}
