import { Invitation } from "../../../../domain/entities";
import { ExpirationDate, Recipient, Token } from "../../../../domain/value-objects";
import { InvitationRepositorySpy } from "../../../../test-doubles";
import { ListInvitationsByTenantUseCase } from "./index";

const makeInvitation = (overrides: Partial<Parameters<typeof Invitation.restore>[0]> = {}) =>
    Invitation.restore({
        id: "invitation-id",
        tenantId: "tenant-id",
        roleId: "role-id",
        recipient: Recipient.create("test@example.com"),
        mechanism: "EMAIL",
        token: Token.create("123e4567-e89b-12d3-a456-426614174000"),
        expirationDate: ExpirationDate.create(new Date("2026-12-31T00:00:00.000Z")),
        status: "PENDING",
        usedAt: null,
        revokedAt: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        ...overrides,
    });

describe("ListInvitationsByTenantUseCase", () => {
    const makeSut = () => {
        const invitationRepository = new InvitationRepositorySpy();
        const useCase = new ListInvitationsByTenantUseCase(invitationRepository);
        return { useCase, invitationRepository };
    };

    it("should list invitations by tenant successfully", async () => {
        const { useCase, invitationRepository } = makeSut();
        const invitations = [
            makeInvitation({ id: "invitation-1", tenantId: "tenant-id" }),
            makeInvitation({ id: "invitation-2", tenantId: "tenant-id" }),
        ];
        invitationRepository.listByTenant.mockResolvedValue(invitations);
        const result = await useCase.execute("tenant-id");
        expect(invitationRepository.listByTenant).toHaveBeenCalledTimes(1);
        expect(invitationRepository.listByTenant).toHaveBeenCalledWith("tenant-id");
        expect(result).toEqual(invitations);
    });

    it("should return an empty list when there are no invitations", async () => {
        const { useCase, invitationRepository } = makeSut();
        invitationRepository.listByTenant.mockResolvedValue([]);
        const result = await useCase.execute("tenant-id");
        expect(invitationRepository.listByTenant).toHaveBeenCalledTimes(1);
        expect(invitationRepository.listByTenant).toHaveBeenCalledWith("tenant-id");
        expect(result).toEqual([]);
    });

    it("should propagate repository errors", async () => {
        const { useCase, invitationRepository } = makeSut();
        invitationRepository.listByTenant.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("tenant-id")).rejects.toThrow("Database error");
        expect(invitationRepository.listByTenant).toHaveBeenCalledTimes(1);
        expect(invitationRepository.listByTenant).toHaveBeenCalledWith("tenant-id");
    });
});
