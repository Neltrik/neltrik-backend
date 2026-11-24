import type { IdGenerator } from "@/shared/id-generator";
import type { OutboxRepository } from "@/shared/outbox";

import { CompanyNotFoundError, MembershipAlreadyExistsError } from "../../../../domain/errors";
import {
    AuthorizationRoleApiSpy,
    CompanyRepositorySpy,
    MembershipRepositorySpy,
    TransactionManagerSpy,
    UserApiSpy,
} from "../../../../test-doubles";
import { InviteMemberUseCase } from "./index";
import type { InviteMemberInput } from "./input";

describe("InviteMemberUseCase", () => {
    const makeSut = () => {
        const authorizationRoleApi = new AuthorizationRoleApiSpy();
        const userApi = new UserApiSpy();
        const idGenerator = {
            generate: jest.fn().mockReturnValue("membership-id"),
        } satisfies IdGenerator;
        const outboxRepository: jest.Mocked<OutboxRepository> = {
            create: jest.fn().mockResolvedValue(undefined),
            findPending: jest.fn().mockResolvedValue([]),
            markProcessed: jest.fn().mockResolvedValue(undefined),
            markFailed: jest.fn().mockResolvedValue(undefined),
        };
        const transactionManager = new TransactionManagerSpy();
        const companyRepository = new CompanyRepositorySpy();
        const membershipRepository = new MembershipRepositorySpy();
        const inviteMemberUseCase = new InviteMemberUseCase(
            authorizationRoleApi,
            userApi,
            idGenerator,
            outboxRepository,
            transactionManager,
            companyRepository,
            membershipRepository,
        );
        return {
            inviteMemberUseCase,
            authorizationRoleApi,
            userApi,
            idGenerator,
            outboxRepository,
            transactionManager,
            companyRepository,
            membershipRepository,
        };
    };
    const makeInput = (): InviteMemberInput => ({
        companyId: "company-id",
        userId: "user-id",
        roleId: "role-id",
        tenantId: "tenant-id",
        actorUserId: "actor-user-id",
    });
    const mockCompany = () => ({ tenantId: "tenant-id", name: "Acme Corporation" }) as never;
    const mockMembership = (pending: boolean, active: boolean, expired = false) => ({
        isPending: jest.fn().mockReturnValue(pending),
        isActive: jest.fn().mockReturnValue(active),
        isExpired: jest.fn().mockReturnValue(expired),
        revoke: jest.fn(),
    });

    describe("execute", () => {
        it("should create the membership, publish the event and return its id", async () => {
            const {
                inviteMemberUseCase,
                authorizationRoleApi,
                userApi,
                idGenerator,
                outboxRepository,
                transactionManager,
                companyRepository,
                membershipRepository,
            } = makeSut();
            const input = makeInput();
            companyRepository.findById.mockResolvedValue(mockCompany());
            membershipRepository.findByUserAndCompany.mockResolvedValue(null);
            await expect(inviteMemberUseCase.execute(input)).resolves.toEqual({ id: "membership-id" });
            expect(userApi.validateUserById).toHaveBeenCalledWith(input.userId);
            expect(authorizationRoleApi.validateForTenant).toHaveBeenCalledWith({
                roleId: input.roleId,
                tenantId: input.tenantId,
            });
            expect(idGenerator.generate).toHaveBeenCalledTimes(1);
            expect(transactionManager.executeCalls).toBe(1);
            const membership = membershipRepository.create.mock.calls[0]?.[0];
            expect(membership?.id).toBe("membership-id");
            expect(membership?.tenantId).toBe("tenant-id");
            expect(membership?.userId).toBe(input.userId);
            expect(membership?.companyId).toBe(input.companyId);
            expect(membership?.roleId).toBe(input.roleId);
            expect(membership!.expiresAt!.getTime() - membership!.createdAt.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
            expect(outboxRepository.create).toHaveBeenCalledWith(
                {
                    eventType: "SEND_INVITATION_EMAIL",
                    payload: {
                        membershipId: "membership-id",
                        userId: input.userId,
                        tenantId: "tenant-id",
                        companyName: "Acme Corporation",
                        inviterUserId: input.actorUserId,
                    },
                },
                expect.anything(),
            );
        });

        it("should throw CompanyNotFoundError when the company does not exist", async () => {
            const { inviteMemberUseCase, companyRepository, userApi, authorizationRoleApi, transactionManager } =
                makeSut();
            companyRepository.findById.mockResolvedValue(null);
            await expect(inviteMemberUseCase.execute(makeInput())).rejects.toThrow(CompanyNotFoundError);
            expect(userApi.validateUserById).not.toHaveBeenCalled();
            expect(authorizationRoleApi.validateForTenant).not.toHaveBeenCalled();
            expect(transactionManager.executeCalls).toBe(0);
        });

        it.each([
            ["active", false, true, false],
            ["pending and not expired", true, false, false],
        ])("should throw MembershipAlreadyExistsError when membership is %s", async (_, pending, active, expired) => {
            const { inviteMemberUseCase, companyRepository, membershipRepository, idGenerator } = makeSut();
            companyRepository.findById.mockResolvedValue(mockCompany());
            membershipRepository.findByUserAndCompany.mockResolvedValue(
                mockMembership(pending, active, expired) as never,
            );
            await expect(inviteMemberUseCase.execute(makeInput())).rejects.toThrow(MembershipAlreadyExistsError);
            expect(idGenerator.generate).not.toHaveBeenCalled();
            expect(membershipRepository.update).not.toHaveBeenCalled();
        });

        it("should revoke an expired pending membership and create a new one", async () => {
            const { inviteMemberUseCase, companyRepository, membershipRepository, outboxRepository } = makeSut();
            const existing = mockMembership(true, false, true);
            companyRepository.findById.mockResolvedValue(mockCompany());
            membershipRepository.findByUserAndCompany.mockResolvedValue(existing as never);
            await expect(inviteMemberUseCase.execute(makeInput())).resolves.toEqual({ id: "membership-id" });
            expect(existing.revoke).toHaveBeenCalledTimes(1);
            expect(membershipRepository.update).toHaveBeenCalledWith(existing);
            expect(membershipRepository.create).toHaveBeenCalledTimes(1);
            expect(outboxRepository.create).toHaveBeenCalledTimes(1);
        });

        it("should allow creating a membership when the existing membership is inactive", async () => {
            const { inviteMemberUseCase, companyRepository, membershipRepository } = makeSut();
            companyRepository.findById.mockResolvedValue(mockCompany());
            membershipRepository.findByUserAndCompany.mockResolvedValue(mockMembership(false, false) as never);
            await expect(inviteMemberUseCase.execute(makeInput())).resolves.toEqual({ id: "membership-id" });
            expect(membershipRepository.update).not.toHaveBeenCalled();
            expect(membershipRepository.create).toHaveBeenCalledTimes(1);
        });

        it.each([
            ["user validation", "user"],
            ["role validation", "role"],
            ["finding the membership", "find"],
            ["creating the membership", "create"],
            ["creating the outbox event", "outbox"],
        ])("should propagate errors when %s fails", async (_, operation) => {
            const {
                inviteMemberUseCase,
                companyRepository,
                userApi,
                authorizationRoleApi,
                membershipRepository,
                outboxRepository,
            } = makeSut();
            const error = new Error("Operation failed");
            companyRepository.findById.mockResolvedValue(mockCompany());
            membershipRepository.findByUserAndCompany.mockResolvedValue(null);
            if (operation === "user") {
                userApi.validateUserById.mockRejectedValue(error);
            }
            if (operation === "role") {
                authorizationRoleApi.validateForTenant.mockRejectedValue(error);
            }
            if (operation === "find") {
                membershipRepository.findByUserAndCompany.mockRejectedValue(error);
            }
            if (operation === "create") {
                membershipRepository.create.mockRejectedValue(error);
            }
            if (operation === "outbox") {
                outboxRepository.create.mockRejectedValue(error);
            }
            await expect(inviteMemberUseCase.execute(makeInput())).rejects.toThrow(error);
        });
    });
});
