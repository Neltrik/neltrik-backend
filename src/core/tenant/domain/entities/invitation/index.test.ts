import {
    InvalidInvitationStatusError,
    InvitationAlreadyRevokedError,
    InvitationAlreadyUsedError,
    InvitationExpiredError,
} from "../../errors";
import { INVITATION_STATUS, type InvitationProps } from "../../types";
import { ExpirationDate, Recipient, Token } from "../../value-objects";
import { Invitation } from "./";

const createProps = (): Omit<InvitationProps, "status"> => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    return {
        id: "invitation-id",
        tenantId: "tenant-id",
        roleId: "role-id",
        recipient: Recipient.create("test@example.com"),
        token: Token.create("123e4567-e89b-12d3-a456-426614174000"),
        expirationDate: ExpirationDate.create(futureDate),
        usedAt: null,
        revokedAt: null,
        createdAt: now,
        updatedAt: now,
    };
};

const restoreProps = (): InvitationProps => ({
    ...createProps(),
    status: INVITATION_STATUS.PENDING,
});

const restoreExpiredProps = (): InvitationProps => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    return {
        ...createProps(),
        expirationDate: ExpirationDate.create(expirationDate),
        status: INVITATION_STATUS.PENDING,
    };
};

describe("Invitation", () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it("should restore an invitation preserving its persisted status", () => {
        const invitation = Invitation.restore(restoreProps());
        expect(invitation.status).toBe(INVITATION_STATUS.PENDING);
    });

    it("should create an invitation with pending status", () => {
        const invitation = Invitation.create(createProps());
        expect(invitation.status).toBe(INVITATION_STATUS.PENDING);
    });

    it("should restore an expired invitation and update status to EXPIRED", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-08-21T12:00:00.000Z"));
        const props = restoreExpiredProps();
        jest.setSystemTime(new Date("2026-08-29T12:00:00.000Z"));
        const invitation = Invitation.restore(props);
        expect(invitation.status).toBe(INVITATION_STATUS.EXPIRED);
        expect(invitation.isExpired()).toBe(true);
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const invitation = Invitation.create(props);
        expect(invitation.id).toBe(props.id);
        expect(invitation.tenantId).toBe(props.tenantId);
        expect(invitation.roleId).toBe(props.roleId);
        expect(invitation.recipient).toBe(props.recipient);
        expect(invitation.token).toBe(props.token);
        expect(invitation.expirationDate).toBe(props.expirationDate);
        expect(invitation.usedAt).toBeNull();
        expect(invitation.revokedAt).toBeNull();
        expect(invitation.status).toBe(INVITATION_STATUS.PENDING);
        expect(invitation.createdAt).toEqual(props.createdAt);
        expect(invitation.updatedAt).toEqual(props.updatedAt);
    });

    it("should use an invitation successfully", () => {
        const invitation = Invitation.create(createProps());
        invitation.use();
        expect(invitation.status).toBe(INVITATION_STATUS.USED);
        expect(invitation.usedAt).not.toBeNull();
        expect(invitation.updatedAt.getTime()).toBeGreaterThanOrEqual(invitation.createdAt.getTime());
    });

    it("should throw InvitationAlreadyUsedError when using an already used invitation", () => {
        const invitation = Invitation.create(createProps());
        invitation.use();
        expect(() => invitation.use()).toThrow(InvitationAlreadyUsedError);
    });

    it("should throw InvitationExpiredError when using an expired invitation", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-08-21T12:00:00.000Z"));
        const props = restoreExpiredProps();
        jest.setSystemTime(new Date("2026-08-29T12:00:00.000Z"));
        const invitation = Invitation.restore(props);
        expect(() => invitation.use()).toThrow(InvitationExpiredError);
    });

    it("should revoke an invitation successfully", () => {
        const invitation = Invitation.create(createProps());
        invitation.revoke();
        expect(invitation.status).toBe(INVITATION_STATUS.REVOKED);
        expect(invitation.revokedAt).not.toBeNull();
        expect(invitation.updatedAt.getTime()).toBeGreaterThanOrEqual(invitation.createdAt.getTime());
    });

    it("should throw InvitationAlreadyRevokedError when revoking an already revoked invitation", () => {
        const invitation = Invitation.create(createProps());
        invitation.revoke();
        expect(() => invitation.revoke()).toThrow(InvitationAlreadyRevokedError);
    });

    it("should throw InvitationAlreadyUsedError when revoking an already used invitation", () => {
        const invitation = Invitation.create(createProps());
        invitation.use();
        expect(() => invitation.revoke()).toThrow(InvitationAlreadyUsedError);
    });

    it("should throw InvitationExpiredError when revoking an expired invitation", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-08-21T12:00:00.000Z"));
        const props = restoreExpiredProps();
        jest.setSystemTime(new Date("2026-08-29T12:00:00.000Z"));
        const invitation = Invitation.restore(props);
        expect(() => invitation.revoke()).toThrow(InvitationExpiredError);
    });

    it("should check if invitation is pending correctly", () => {
        const invitation = Invitation.create(createProps());
        expect(invitation.isPending()).toBe(true);
        invitation.use();
        expect(invitation.isPending()).toBe(false);
    });

    it("should check if invitation is expired correctly", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-08-21T12:00:00.000Z"));
        const props = restoreExpiredProps();
        const invitation = Invitation.restore(props);
        expect(invitation.isExpired()).toBe(false);
        jest.setSystemTime(new Date("2026-08-29T12:00:00.000Z"));
        expect(invitation.isExpired()).toBe(true);
    });

    it("should check if invitation is used correctly", () => {
        const invitation = Invitation.create(createProps());
        expect(invitation.isUsed()).toBe(false);
        invitation.use();
        expect(invitation.isUsed()).toBe(true);
    });

    it("should check if invitation is revoked correctly", () => {
        const invitation = Invitation.create(createProps());
        expect(invitation.isRevoked()).toBe(false);
        invitation.revoke();
        expect(invitation.isRevoked()).toBe(true);
    });

    it("should throw InvalidInvitationStatusError when restoring an invitation with an invalid status", () => {
        const props = {
            ...restoreProps(),
            status: "INVALID_STATUS" as InvitationProps["status"],
        };
        expect(() => Invitation.restore(props)).toThrow(InvalidInvitationStatusError);
    });

    it("should throw InvitationAlreadyRevokedError when the invitation is revoked", () => {
        const invitation = Invitation.restore({
            ...restoreProps(),
            status: INVITATION_STATUS.REVOKED,
        });
        expect(invitation.isRevoked()).toBe(true);
        expect(() => {
            (invitation as unknown as { ensureIsNotRevoked: () => void }).ensureIsNotRevoked();
        }).toThrow(InvitationAlreadyRevokedError);
    });
});
