import { Invitation } from "../../../domain/entities";
import { INVITATION_STATUS, type InvitationState } from "../../../domain/types";
import { ExpirationDate, Recipient, Token } from "../../../domain/value-objects";
import { InvitationMapper } from "./index";

const NOW = new Date("2025-01-01T00:00:00.000Z");
const EXPIRATION_DATE = new Date("2025-01-08T00:00:00.000Z");

const createProps = (): InvitationState => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "invitation-id",
        tenantId: "tenant-id",
        roleId: "role-id",
        recipient: Recipient.create("test@example.com"),
        mechanism: "EMAIL",
        token: Token.create("123e4567-e89b-12d3-a456-426614174000"),
        expirationDate: ExpirationDate.create(EXPIRATION_DATE),
        status: INVITATION_STATUS.PENDING,
        usedAt: null,
        revokedAt: null,
        createdAt,
        updatedAt: createdAt,
    };
};

describe("InvitationMapper", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(NOW);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should map a domain invitation to persistence", () => {
        const invitation = Invitation.restore(createProps());
        const persistence = InvitationMapper.toPersistence(invitation);
        expect(persistence).toEqual({
            id: invitation.id,
            tenantId: invitation.tenantId,
            roleId: invitation.roleId,
            recipient: invitation.recipient.value,
            mechanism: invitation.mechanism,
            token: invitation.token.value,
            expiresAt: invitation.expirationDate.value,
            status: invitation.status,
            usedAt: invitation.usedAt,
            revokedAt: invitation.revokedAt,
            createdAt: invitation.createdAt,
            updatedAt: invitation.updatedAt,
        });
    });

    it("should map a persistence invitation to domain", () => {
        const persistence = {
            id: "invitation-id",
            tenantId: "tenant-id",
            roleId: "role-id",
            recipient: "test@example.com",
            mechanism: "EMAIL",
            token: "123e4567-e89b-12d3-a456-426614174000",
            expiresAt: EXPIRATION_DATE,
            status: INVITATION_STATUS.PENDING,
            usedAt: null,
            revokedAt: null,
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
            updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        };
        const invitation = InvitationMapper.toDomain(persistence);
        expect(invitation).toBeInstanceOf(Invitation);
        expect(invitation.id).toBe(persistence.id);
        expect(invitation.tenantId).toBe(persistence.tenantId);
        expect(invitation.roleId).toBe(persistence.roleId);
        expect(invitation.recipient.value).toBe(persistence.recipient);
        expect(invitation.mechanism).toBe(persistence.mechanism);
        expect(invitation.token.value).toBe(persistence.token);
        expect(invitation.expirationDate.value).toEqual(persistence.expiresAt);
        expect(invitation.status).toBe(persistence.status);
        expect(invitation.usedAt).toBeNull();
        expect(invitation.revokedAt).toBeNull();
        expect(invitation.createdAt).toEqual(persistence.createdAt);
        expect(invitation.updatedAt).toEqual(persistence.updatedAt);
    });

    it("should preserve usedAt when mapping to domain", () => {
        const usedAt = new Date("2025-01-05T00:00:00.000Z");
        const persistence = {
            id: "invitation-id",
            tenantId: "tenant-id",
            roleId: "role-id",
            recipient: "test@example.com",
            mechanism: "EMAIL",
            token: "123e4567-e89b-12d3-a456-426614174000",
            expiresAt: EXPIRATION_DATE,
            status: INVITATION_STATUS.USED,
            usedAt,
            revokedAt: null,
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
            updatedAt: usedAt,
        };
        const invitation = InvitationMapper.toDomain(persistence);
        expect(invitation.status).toBe(INVITATION_STATUS.USED);
        expect(invitation.usedAt).toEqual(usedAt);
        expect(invitation.revokedAt).toBeNull();
    });

    it("should preserve revokedAt when mapping to domain", () => {
        const revokedAt = new Date("2025-01-05T00:00:00.000Z");
        const persistence = {
            id: "invitation-id",
            tenantId: "tenant-id",
            roleId: "role-id",
            recipient: "test@example.com",
            mechanism: "EMAIL",
            token: "123e4567-e89b-12d3-a456-426614174000",
            expiresAt: EXPIRATION_DATE,
            status: INVITATION_STATUS.REVOKED,
            usedAt: null,
            revokedAt,
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
            updatedAt: revokedAt,
        };
        const invitation = InvitationMapper.toDomain(persistence);
        expect(invitation.status).toBe(INVITATION_STATUS.REVOKED);
        expect(invitation.usedAt).toBeNull();
        expect(invitation.revokedAt).toEqual(revokedAt);
    });
});
