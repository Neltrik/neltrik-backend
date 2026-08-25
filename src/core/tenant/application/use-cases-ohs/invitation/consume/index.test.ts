import { Invitation } from "../../../../domain/entities";
import {
    InvitationAlreadyRevokedError,
    InvitationAlreadyUsedError,
    InvitationExpiredError,
    InvitationNotFoundError,
} from "../../../../domain/errors";
import { ExpirationDate, Recipient, Token } from "../../../../domain/value-objects";
import { InvitationRepositorySpy } from "../../../../test-doubles";
import { ConsumeInvitationOhsUseCase } from "./index";

const VALID_TOKEN = "550e8400-e29b-41d4-a716-446655440000";

const makeInvitation = (): Invitation => {
    const now = new Date();
    return Invitation.create({
        id: "invitation-id",
        tenantId: "tenant-id",
        roleId: "role-id",
        recipient: Recipient.create("user@example.com"),
        token: Token.create(VALID_TOKEN),
        expirationDate: ExpirationDate.create(new Date(now.getTime() + 86_400_000)),
        mechanism: "EMAIL",
        usedAt: null,
        revokedAt: null,
        createdAt: now,
        updatedAt: now,
    });
};

describe("ConsumeInvitationOhsUseCase", () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    const makeSut = () => {
        const invitationRepository = new InvitationRepositorySpy();
        invitationRepository.getByToken.mockResolvedValue(makeInvitation());
        invitationRepository.update.mockResolvedValue(undefined);
        const useCase = new ConsumeInvitationOhsUseCase(invitationRepository);
        return { useCase, invitationRepository };
    };

    it("should consume an invitation successfully", async () => {
        const { useCase, invitationRepository } = makeSut();
        const result = await useCase.execute(VALID_TOKEN);
        expect(invitationRepository.getByToken).toHaveBeenCalledWith(VALID_TOKEN);
        expect(invitationRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ invitationId: "invitation-id" });
    });

    it("should throw when invitation does not exist", async () => {
        const { useCase, invitationRepository } = makeSut();
        invitationRepository.getByToken.mockResolvedValue(null);
        await expect(useCase.execute("invalid-token")).rejects.toThrow(InvitationNotFoundError);
        expect(invitationRepository.getByToken).toHaveBeenCalledWith("invalid-token");
        expect(invitationRepository.update).not.toHaveBeenCalled();
    });

    it("should throw when invitation has already been used", async () => {
        const { useCase, invitationRepository } = makeSut();
        const invitation = makeInvitation();
        invitation.use();
        invitationRepository.getByToken.mockResolvedValue(invitation);
        await expect(useCase.execute(VALID_TOKEN)).rejects.toThrow(InvitationAlreadyUsedError);
        expect(invitationRepository.update).not.toHaveBeenCalled();
    });

    it("should throw when invitation has been revoked", async () => {
        const { useCase, invitationRepository } = makeSut();
        const invitation = makeInvitation();
        invitation.revoke();
        invitationRepository.getByToken.mockResolvedValue(invitation);
        await expect(useCase.execute(VALID_TOKEN)).rejects.toThrow(InvitationAlreadyRevokedError);
        expect(invitationRepository.update).not.toHaveBeenCalled();
    });

    it("should throw when invitation has expired", async () => {
        jest.useFakeTimers();
        const now = new Date("2026-08-21T12:00:00.000Z");
        jest.setSystemTime(now);
        const invitation = Invitation.create({
            id: "invitation-id",
            tenantId: "tenant-id",
            roleId: "role-id",
            recipient: Recipient.create("user@example.com"),
            token: Token.create(VALID_TOKEN),
            expirationDate: ExpirationDate.create(new Date("2026-08-22T12:00:00.000Z")),
            mechanism: "EMAIL",
            usedAt: null,
            revokedAt: null,
            createdAt: now,
            updatedAt: now,
        });
        const { useCase, invitationRepository } = makeSut();
        invitationRepository.getByToken.mockResolvedValue(invitation);
        jest.setSystemTime(new Date("2026-08-23T12:00:00.000Z"));
        await expect(useCase.execute(VALID_TOKEN)).rejects.toThrow(InvitationExpiredError);
        expect(invitationRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, invitationRepository } = makeSut();
        invitationRepository.getByToken.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(VALID_TOKEN)).rejects.toThrow("Database error");
    });

    it("should propagate repository update errors", async () => {
        const { useCase, invitationRepository } = makeSut();
        invitationRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(VALID_TOKEN)).rejects.toThrow("Database error");
    });
});
