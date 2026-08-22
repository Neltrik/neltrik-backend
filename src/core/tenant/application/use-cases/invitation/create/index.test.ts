import type { IdGenerator } from "@/shared/id-generator";

import { Invitation, Tenant } from "../../../../domain/entities";
import { InvitationAlreadyExistsError, TenantNotFoundError } from "../../../../domain/errors";
import { ExpirationDate, Recipient, Token } from "../../../../domain/value-objects";
import { InvitationDeliveryStrategyFactory, ManualStrategy } from "../../../../infrastructure/strategies";
import { AuthorizationRoleApiSpy, InvitationRepositorySpy, TenantRepositorySpy } from "../../../../test-doubles";
import { CreateInvitationUseCase } from "./index";
import type { CreateInvitationInput } from "./input";

const makeInput = (): CreateInvitationInput => ({
    tenantId: "tenant-id",
    roleId: "role-id",
    recipient: "user@example.com",
    mechanism: "manual",
});

const makeTenant = (): Tenant =>
    Tenant.create({
        id: "tenant-id",
        name: "Acme Corp",
        type: "CUSTOMER",
        slug: "acme-corp",
        createdAt: new Date(),
        suspendedAt: null,
        updatedAt: new Date(),
    });

const makeInvitation = (): Invitation => {
    const now = new Date();
    return Invitation.create({
        id: "invitation-id",
        tenantId: "tenant-id",
        roleId: "role-id",
        recipient: Recipient.create("user@example.com"),
        token: Token.create("550e8400-e29b-41d4-a716-446655440000"),
        expirationDate: ExpirationDate.create(new Date(now.getTime() + 86_400_000)),
        mechanism: "manual",
        usedAt: null,
        revokedAt: null,
        createdAt: now,
        updatedAt: now,
    });
};

describe("CreateInvitationUseCase", () => {
    const makeSut = () => {
        const invitationRepository = new InvitationRepositorySpy();
        invitationRepository.create.mockResolvedValue(undefined);
        invitationRepository.findPendingByTenantAndRecipient.mockResolvedValue(null);
        const tenantRepository = new TenantRepositorySpy();
        tenantRepository.get.mockResolvedValue(makeTenant());
        const authorizationRoleApi = new AuthorizationRoleApiSpy();
        authorizationRoleApi.validateForTenant.mockResolvedValue(undefined);
        const generateMagicLinkMock = jest.fn().mockReturnValue("https://example.com/invitation/token");
        const magicLinkGenerator = {
            generate: generateMagicLinkMock,
        };
        const manualStrategy = new ManualStrategy(magicLinkGenerator);
        const strategyFactory = new InvitationDeliveryStrategyFactory(manualStrategy);
        const generateMock = jest
            .fn()
            .mockReturnValueOnce("invitation-id")
            .mockReturnValueOnce("550e8400-e29b-41d4-a716-446655440000");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const useCase = new CreateInvitationUseCase(
            invitationRepository,
            tenantRepository,
            authorizationRoleApi,
            strategyFactory,
            idGenerator,
        );
        return {
            useCase,
            invitationRepository,
            tenantRepository,
            authorizationRoleApi,
            generateMock,
            generateMagicLinkMock,
        };
    };

    it("should create an invitation successfully", async () => {
        const { useCase, invitationRepository, authorizationRoleApi, generateMock, generateMagicLinkMock } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(generateMock).toHaveBeenCalledTimes(2);
        expect(authorizationRoleApi.validateForTenant).toHaveBeenCalledWith({
            roleId: "role-id",
            tenantId: "tenant-id",
        });
        expect(invitationRepository.findPendingByTenantAndRecipient).toHaveBeenCalledWith(
            "tenant-id",
            "user@example.com",
        );
        expect(invitationRepository.create).toHaveBeenCalledTimes(1);
        expect(generateMagicLinkMock).toHaveBeenCalledWith("550e8400-e29b-41d4-a716-446655440000");
        expect(result).toEqual({
            invitationId: "invitation-id",
            magicLink: "https://example.com/invitation/token",
        });
    });

    it("should throw when tenant does not exist", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.get.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(TenantNotFoundError);
        expect(tenantRepository.get).toHaveBeenCalledWith("tenant-id");
    });

    it("should throw when a pending invitation already exists", async () => {
        const { useCase, invitationRepository } = makeSut();
        invitationRepository.findPendingByTenantAndRecipient.mockResolvedValue(makeInvitation());
        await expect(useCase.execute(makeInput())).rejects.toThrow(InvitationAlreadyExistsError);
        expect(invitationRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.get.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
