import type { IdGenerator } from "@/shared/id-generator";
import type { OutboxRepository } from "@/shared/outbox";

import { CompanyNotFoundError, MembershipAlreadyExistsError } from "../../../../domain/errors";
import { CompanyRepositorySpy, MembershipRepositorySpy, TransactionManagerSpy } from "../../../../test-doubles";
import { InviteMemberUseCase } from "./index";
import type { InviteMemberInput } from "./input";

describe("InviteMemberUseCase", () => {
    const makeSut = () => {
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
            idGenerator,
            outboxRepository,
            transactionManager,
            companyRepository,
            membershipRepository,
        );
        return {
            inviteMemberUseCase,
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
        actorTenantId: "id",
        actorUserId: "",
    });

    const mockCompany = () =>
        ({
            tenantId: "tenant-id",
        }) as never;

    describe("execute", () => {
        it("should create the membership, publish the invitation event and return its id", async () => {
            const {
                inviteMemberUseCase,
                idGenerator,
                outboxRepository,
                transactionManager,
                companyRepository,
                membershipRepository,
            } = makeSut();
            const input = makeInput();
            companyRepository.findById.mockResolvedValue(mockCompany());
            membershipRepository.findByUserAndCompany.mockResolvedValue(null);
            await expect(inviteMemberUseCase.execute(input)).resolves.toEqual({
                id: "membership-id",
            });
            expect(companyRepository.findById).toHaveBeenCalledWith(input.companyId);
            expect(membershipRepository.findByUserAndCompany).toHaveBeenCalledWith(input.userId, input.companyId);
            expect(idGenerator.generate).toHaveBeenCalledTimes(1);
            expect(transactionManager.executeCalls).toBe(1);
            expect(membershipRepository.create).toHaveBeenCalledTimes(1);
            const membership = membershipRepository.create.mock.calls[0]?.[0];
            expect(membership).toBeDefined();
            expect(membership?.id).toBe("membership-id");
            expect(membership?.tenantId).toBe("tenant-id");
            expect(membership?.userId).toBe(input.userId);
            expect(membership?.companyId).toBe(input.companyId);
            expect(membership?.roleId).toBe(input.roleId);
            expect(membership?.createdAt).toBeInstanceOf(Date);
            expect(outboxRepository.create).toHaveBeenCalledWith(
                {
                    eventType: "SEND_INVITATION_EMAIL",
                    payload: {
                        membershipId: "membership-id",
                        companyId: input.companyId,
                        userId: input.userId,
                        tenantId: "tenant-id",
                    },
                },
                expect.anything(),
            );
        });

        it("should throw CompanyNotFoundError when the company does not exist", async () => {
            const { inviteMemberUseCase, idGenerator, companyRepository, membershipRepository, transactionManager } =
                makeSut();
            companyRepository.findById.mockResolvedValue(null);
            await expect(inviteMemberUseCase.execute(makeInput())).rejects.toThrow(CompanyNotFoundError);
            expect(membershipRepository.findByUserAndCompany).not.toHaveBeenCalled();
            expect(idGenerator.generate).not.toHaveBeenCalled();
            expect(transactionManager.executeCalls).toBe(0);
        });

        it.each([
            ["pending", true, false],
            ["active", false, true],
        ])("should throw MembershipAlreadyExistsError when membership is %s", async (_, isPending, isActive) => {
            const { inviteMemberUseCase, idGenerator, companyRepository, membershipRepository, transactionManager } =
                makeSut();
            companyRepository.findById.mockResolvedValue(mockCompany());
            membershipRepository.findByUserAndCompany.mockResolvedValue({
                isPending: jest.fn().mockReturnValue(isPending),
                isActive: jest.fn().mockReturnValue(isActive),
            } as never);
            await expect(inviteMemberUseCase.execute(makeInput())).rejects.toThrow(MembershipAlreadyExistsError);
            expect(idGenerator.generate).not.toHaveBeenCalled();
            expect(transactionManager.executeCalls).toBe(0);
        });

        it("should allow creating a membership when the existing membership is inactive", async () => {
            const { inviteMemberUseCase, companyRepository, membershipRepository, outboxRepository } = makeSut();
            companyRepository.findById.mockResolvedValue(mockCompany());
            membershipRepository.findByUserAndCompany.mockResolvedValue({
                isPending: jest.fn().mockReturnValue(false),
                isActive: jest.fn().mockReturnValue(false),
            } as never);
            await expect(inviteMemberUseCase.execute(makeInput())).resolves.toEqual({
                id: "membership-id",
            });
            expect(membershipRepository.create).toHaveBeenCalledTimes(1);
            expect(outboxRepository.create).toHaveBeenCalledTimes(1);
        });

        it.each([
            ["finding the company", "findCompany"],
            ["finding the membership", "findMembership"],
            ["creating the membership", "createMembership"],
            ["creating the outbox event", "createOutbox"],
            ["executing the transaction", "transaction"],
        ])("should propagate errors when %s fails", async (_, operation) => {
            const {
                inviteMemberUseCase,
                companyRepository,
                membershipRepository,
                outboxRepository,
                transactionManager,
            } = makeSut();
            const error = new Error("Operation failed");
            companyRepository.findById.mockResolvedValue(mockCompany());
            membershipRepository.findByUserAndCompany.mockResolvedValue(null);
            if (operation === "findCompany") {
                companyRepository.findById.mockRejectedValue(error);
            } else if (operation === "findMembership") {
                membershipRepository.findByUserAndCompany.mockRejectedValue(error);
            } else if (operation === "createMembership") {
                membershipRepository.create.mockRejectedValue(error);
            } else if (operation === "createOutbox") {
                outboxRepository.create.mockRejectedValue(error);
            } else {
                transactionManager.shouldFail = true;
            }
            await expect(inviteMemberUseCase.execute(makeInput())).rejects.toThrow(
                operation === "transaction" ? "Transaction failed" : "Operation failed",
            );
        });
    });
});
