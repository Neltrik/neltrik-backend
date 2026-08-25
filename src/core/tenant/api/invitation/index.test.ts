import { ConsumeInvitationOhsUseCaseSpy, ValidateInvitationOhsUseCaseSpy } from "../../test-doubles";
import { InvitationApiImpl } from "./index";
import { ConsumeInvitationResultDto, InvitationResultDto } from "./result.dto";

const makeInvitationResult = (): InvitationResultDto => ({
    invitationId: "invitation-id",
    tenantId: "tenant-id",
    roleId: "role-id",
    recipient: "user@example.com",
});

const makeConsumeInvitationResult = (): ConsumeInvitationResultDto => ({
    invitationId: "invitation-id",
});

describe("InvitationApiImpl", () => {
    const makeSut = () => {
        const consumeInvitationOhsUseCase = new ConsumeInvitationOhsUseCaseSpy();
        const validateInvitationOhsUseCase = new ValidateInvitationOhsUseCaseSpy();
        const invitationApi = new InvitationApiImpl(consumeInvitationOhsUseCase, validateInvitationOhsUseCase);
        return { invitationApi, consumeInvitationOhsUseCase, validateInvitationOhsUseCase };
    };

    describe("validate", () => {
        it("should validate the invitation successfully", async () => {
            const { invitationApi, validateInvitationOhsUseCase } = makeSut();
            const invitationResult = makeInvitationResult();
            validateInvitationOhsUseCase.execute.mockResolvedValue(invitationResult);
            await expect(invitationApi.validate("invitation-token")).resolves.toEqual(invitationResult);
            expect(validateInvitationOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(validateInvitationOhsUseCase.execute).toHaveBeenCalledWith("invitation-token");
        });

        it("should propagate invitation validation errors", async () => {
            const { invitationApi, validateInvitationOhsUseCase } = makeSut();
            validateInvitationOhsUseCase.execute.mockRejectedValue(new Error("Invitation not found"));
            await expect(invitationApi.validate("invitation-token")).rejects.toThrow("Invitation not found");
            expect(validateInvitationOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(validateInvitationOhsUseCase.execute).toHaveBeenCalledWith("invitation-token");
        });
    });

    describe("consume", () => {
        it("should consume the invitation successfully", async () => {
            const { invitationApi, consumeInvitationOhsUseCase } = makeSut();
            const consumeInvitationResult = makeConsumeInvitationResult();
            consumeInvitationOhsUseCase.execute.mockResolvedValue(consumeInvitationResult);
            await expect(invitationApi.consume("invitation-token")).resolves.toEqual(consumeInvitationResult);
            expect(consumeInvitationOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(consumeInvitationOhsUseCase.execute).toHaveBeenCalledWith("invitation-token");
        });

        it("should propagate invitation consumption errors", async () => {
            const { invitationApi, consumeInvitationOhsUseCase } = makeSut();
            consumeInvitationOhsUseCase.execute.mockRejectedValue(new Error("Invitation already consumed"));
            await expect(invitationApi.consume("invitation-token")).rejects.toThrow("Invitation already consumed");
            expect(consumeInvitationOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(consumeInvitationOhsUseCase.execute).toHaveBeenCalledWith("invitation-token");
        });
    });

    describe("InvitationResultDto", () => {
        it("should create an invitation result dto", () => {
            const dto = new InvitationResultDto();
            dto.invitationId = "invitation-id";
            dto.tenantId = "tenant-id";
            dto.roleId = "role-id";
            dto.recipient = "john@company.com";
            expect(dto).toEqual({
                invitationId: "invitation-id",
                tenantId: "tenant-id",
                roleId: "role-id",
                recipient: "john@company.com",
            });
        });
    });

    describe("ConsumeInvitationResultDto", () => {
        it("should create a consume invitation result dto", () => {
            const dto = new ConsumeInvitationResultDto();
            dto.invitationId = "invitation-id";
            expect(dto).toEqual({ invitationId: "invitation-id" });
        });
    });
});
