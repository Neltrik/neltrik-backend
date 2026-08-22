import { Invitation } from "../../../../domain/entities";
import { InvitationAlreadyUsedError, InvitationExpiredError, InvitationNotFoundError } from "../../../../domain/errors";
import { ExpirationDate, Recipient, Token } from "../../../../domain/value-objects";
import { InvitationRepositorySpy } from "../../../../test-doubles";
import { ValidateInvitationUseCase } from "./index";

const VALID_TOKEN = "550e8400-e29b-41d4-a716-446655440000";

const makeInvitation = (expirationDate: Date = new Date(Date.now() + 86_400_000)): Invitation => {
    const now = new Date();
    return Invitation.create({
        id: "invitation-id",
        tenantId: "tenant-id",
        roleId: "role-id",
        recipient: Recipient.create("user@example.com"),
        token: Token.create(VALID_TOKEN),
        expirationDate: ExpirationDate.create(expirationDate),
        mechanism: "manual",
        usedAt: null,
        revokedAt: null,
        createdAt: now,
        updatedAt: now,
    });
};

describe("ValidateInvitationUseCase", () => {
    const makeSut = () => {
        const invitationRepository = new InvitationRepositorySpy();
        invitationRepository.getByToken.mockResolvedValue(makeInvitation());
        const useCase = new ValidateInvitationUseCase(invitationRepository);
        return { useCase, invitationRepository };
    };

    it("should validate an invitation successfully", async () => {
        const { useCase, invitationRepository } = makeSut();
        const result = await useCase.execute(VALID_TOKEN);
        expect(invitationRepository.getByToken).toHaveBeenCalledWith(VALID_TOKEN);
        expect(result).toEqual({
            invitationId: "invitation-id",
            tenantId: "tenant-id",
            roleId: "role-id",
            recipient: "user@example.com",
        });
    });

    it("should throw when invitation does not exist", async () => {
        const { useCase, invitationRepository } = makeSut();
        invitationRepository.getByToken.mockResolvedValue(null);
        await expect(useCase.execute(VALID_TOKEN)).rejects.toThrow(InvitationNotFoundError);
        expect(invitationRepository.getByToken).toHaveBeenCalledWith(VALID_TOKEN);
    });

    it("should throw when invitation has already been used", async () => {
        const { useCase, invitationRepository } = makeSut();
        const invitation = makeInvitation();
        invitation.use();
        invitationRepository.getByToken.mockResolvedValue(invitation);
        await expect(useCase.execute(VALID_TOKEN)).rejects.toThrow(InvitationAlreadyUsedError);
    });

    it("should throw when invitation has expired", async () => {
        const { useCase, invitationRepository } = makeSut();
        const invitation = makeInvitation();
        jest.spyOn(invitation.expirationDate, "isExpired").mockReturnValue(true);
        invitationRepository.getByToken.mockResolvedValue(invitation);
        await expect(useCase.execute(VALID_TOKEN)).rejects.toThrow(InvitationExpiredError);
    });

    it("should propagate repository errors", async () => {
        const { useCase, invitationRepository } = makeSut();
        invitationRepository.getByToken.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(VALID_TOKEN)).rejects.toThrow("Database error");
    });
});
