export interface InvitationDeliveryResult {
    magicLink: string;
}

export abstract class SyncInvitationDeliveryStrategy {
    public abstract deliver(token: string, recipient: string): InvitationDeliveryResult;
}

export abstract class AsyncInvitationDeliveryStrategy {
    public abstract deliver(token: string, recipient: string): Promise<InvitationDeliveryResult>;
}

export type InvitationDeliveryStrategy = SyncInvitationDeliveryStrategy | AsyncInvitationDeliveryStrategy;
