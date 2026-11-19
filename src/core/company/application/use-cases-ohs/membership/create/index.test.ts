import type { IdGenerator } from "@/shared/id-generator";

import type { Company } from "../../../../domain/entities";
import { Membership } from "../../../../domain/entities";
import { CompanyNotFoundError, MembershipAlreadyExistsError } from "../../../../domain/errors";
import { CompanyRepositorySpy, MembershipRepositorySpy } from "../../../../test-doubles";
import { CreateMembershipOhsUseCase } from "./index";
import type { CreateMembershipOhsInput } from "./input";

describe("CreateMembershipOhsUseCase", () => {
    const makeSut = () => {
        const generateMock = jest.fn().mockReturnValue("membership-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const companyRepository = new CompanyRepositorySpy();
        const membershipRepository = new MembershipRepositorySpy();
        const createMembershipOhsUseCase = new CreateMembershipOhsUseCase(
            idGenerator,
            companyRepository,
            membershipRepository,
        );
        return { createMembershipOhsUseCase, idGenerator, companyRepository, membershipRepository };
    };
    const makeInput = (): CreateMembershipOhsInput => ({
        companyId: "company-id",
        userId: "user-id",
        roleId: "role-id",
        tenantId: "",
    });
    const mockCompany = (): Company => ({ id: "company-id", tenantId: "tenant-id" }) as Company;

    describe("execute", () => {
        it("should create an active membership and return its id", async () => {
            const { createMembershipOhsUseCase, idGenerator, companyRepository, membershipRepository } = makeSut();
            const input = makeInput();
            const company = mockCompany();
            companyRepository.findById.mockResolvedValue(company);
            membershipRepository.findByUserAndCompany.mockResolvedValue(null);
            await expect(createMembershipOhsUseCase.execute(input)).resolves.toEqual({
                id: "membership-id",
            });
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(companyRepository.findById).toHaveBeenCalledWith(input.companyId);
            expect(membershipRepository.findByUserAndCompany).toHaveBeenCalledWith(input.userId, input.companyId);
            expect(idGenerator.generate).toHaveBeenCalledTimes(1);
            expect(membershipRepository.create).toHaveBeenCalledTimes(1);
            const createdMembership = membershipRepository.create.mock.calls[0]?.[0];
            expect(createdMembership).toBeDefined();
            expect(createdMembership).toBeInstanceOf(Membership);
            expect(createdMembership?.id).toBe("membership-id");
            expect(createdMembership?.tenantId).toBe(company.tenantId);
            expect(createdMembership?.userId).toBe(input.userId);
            expect(createdMembership?.companyId).toBe(input.companyId);
            expect(createdMembership?.roleId).toBe(input.roleId);
            expect(createdMembership?.expiresAt).toBeNull();
            expect(createdMembership?.isActive()).toBe(true);
        });

        it("should throw CompanyNotFoundError when the company does not exist", async () => {
            const { createMembershipOhsUseCase, idGenerator, companyRepository, membershipRepository } = makeSut();
            companyRepository.findById.mockResolvedValue(null);
            await expect(createMembershipOhsUseCase.execute(makeInput())).rejects.toThrow(CompanyNotFoundError);
            expect(companyRepository.findById).toHaveBeenCalledTimes(1);
            expect(membershipRepository.findByUserAndCompany).not.toHaveBeenCalled();
            expect(idGenerator.generate).not.toHaveBeenCalled();
            expect(membershipRepository.create).not.toHaveBeenCalled();
        });

        it("should throw MembershipAlreadyExistsError when a pending membership already exists", async () => {
            const { createMembershipOhsUseCase, idGenerator, companyRepository, membershipRepository } = makeSut();
            const existingMembership = {
                isPending: jest.fn().mockReturnValue(true),
                isActive: jest.fn().mockReturnValue(false),
            };
            companyRepository.findById.mockResolvedValue(mockCompany());
            membershipRepository.findByUserAndCompany.mockResolvedValue(existingMembership as never);
            await expect(createMembershipOhsUseCase.execute(makeInput())).rejects.toThrow(MembershipAlreadyExistsError);
            expect(existingMembership.isPending).toHaveBeenCalledTimes(1);
            expect(existingMembership.isActive).not.toHaveBeenCalled();
            expect(idGenerator.generate).not.toHaveBeenCalled();
            expect(membershipRepository.create).not.toHaveBeenCalled();
        });

        it("should throw MembershipAlreadyExistsError when an active membership already exists", async () => {
            const { createMembershipOhsUseCase, idGenerator, companyRepository, membershipRepository } = makeSut();
            const existingMembership = {
                isPending: jest.fn().mockReturnValue(false),
                isActive: jest.fn().mockReturnValue(true),
            };
            companyRepository.findById.mockResolvedValue(mockCompany());
            membershipRepository.findByUserAndCompany.mockResolvedValue(existingMembership as never);
            await expect(createMembershipOhsUseCase.execute(makeInput())).rejects.toThrow(MembershipAlreadyExistsError);
            expect(existingMembership.isPending).toHaveBeenCalledTimes(1);
            expect(existingMembership.isActive).toHaveBeenCalledTimes(1);
            expect(idGenerator.generate).not.toHaveBeenCalled();
            expect(membershipRepository.create).not.toHaveBeenCalled();
        });

        it("should create a new membership when an existing membership is revoked", async () => {
            const { createMembershipOhsUseCase, companyRepository, membershipRepository } = makeSut();
            const existingMembership = {
                isPending: jest.fn().mockReturnValue(false),
                isActive: jest.fn().mockReturnValue(false),
            };
            companyRepository.findById.mockResolvedValue(mockCompany());
            membershipRepository.findByUserAndCompany.mockResolvedValue(existingMembership as never);
            await expect(createMembershipOhsUseCase.execute(makeInput())).resolves.toEqual({
                id: "membership-id",
            });
            expect(membershipRepository.create).toHaveBeenCalledTimes(1);
        });

        it.each([
            ["finding the company", "findCompany"],
            ["finding an existing membership", "findMembership"],
            ["generating the membership id", "generateId"],
            ["creating the membership", "createMembership"],
        ])("should propagate errors when %s fails", async (_, operation) => {
            const { createMembershipOhsUseCase, idGenerator, companyRepository, membershipRepository } = makeSut();
            const error = new Error("Operation failed");
            companyRepository.findById.mockResolvedValue(mockCompany());
            membershipRepository.findByUserAndCompany.mockResolvedValue(null);
            if (operation === "findCompany") {
                companyRepository.findById.mockRejectedValue(error);
            } else if (operation === "findMembership") {
                membershipRepository.findByUserAndCompany.mockRejectedValue(error);
            } else if (operation === "generateId") {
                idGenerator.generate.mockImplementation(() => {
                    throw error;
                });
            } else if (operation === "createMembership") {
                membershipRepository.create.mockRejectedValue(error);
            }
            await expect(createMembershipOhsUseCase.execute(makeInput())).rejects.toThrow(error);
        });
    });
});
