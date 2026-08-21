import type { Invitation } from "../../entities";

export abstract class InvitationRepository {
    abstract create(invitation: Invitation): Promise<void>;
    abstract update(invitation: Invitation): Promise<void>;
    abstract getByToken(token: string): Promise<Invitation | null>;
    abstract listByTenant(tenantId: string): Promise<Invitation[]>;
}
