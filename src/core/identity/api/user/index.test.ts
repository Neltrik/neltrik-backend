import { DeleteUserOhsUseCaseSpy, GetUserByIdOhsUseCaseSpy, RegisterUserOhsUseCaseSpy } from "../../test-doubles";
import { UserApiImpl } from "./index";
import { DeleteUserResultDto, GetUserRequestDto, RegisterUserRequestDto, RegisterUserResultDto } from "./result.dto";

const makeSut = () => {
    const deleteUserOhsUseCase = new DeleteUserOhsUseCaseSpy();
    const registerUserOhsUseCase = new RegisterUserOhsUseCaseSpy();
    const getUserByIdOhsUseCase = new GetUserByIdOhsUseCaseSpy();
    const userApi = new UserApiImpl(deleteUserOhsUseCase, registerUserOhsUseCase, getUserByIdOhsUseCase);
    return { userApi, deleteUserOhsUseCase, registerUserOhsUseCase, getUserByIdOhsUseCase };
};

describe("UserApiImpl", () => {
    describe("create", () => {
        it("should register a user successfully", async () => {
            const { userApi, registerUserOhsUseCase } = makeSut();
            const input: RegisterUserRequestDto = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                tenantId: "tenant-id",
                roleId: "role-id",
            };
            const output: RegisterUserResultDto = { id: "user-id" };
            registerUserOhsUseCase.execute.mockResolvedValue(output);
            const result = await userApi.create(input);
            expect(registerUserOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(registerUserOhsUseCase.execute).toHaveBeenCalledWith(input);
            expect(result).toEqual(output);
        });

        it("should propagate user registration errors", async () => {
            const { userApi, registerUserOhsUseCase } = makeSut();
            const input: RegisterUserRequestDto = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                tenantId: "tenant-id",
                roleId: "role-id",
            };
            registerUserOhsUseCase.execute.mockRejectedValue(new Error("Email already exists"));
            await expect(userApi.create(input)).rejects.toThrow("Email already exists");
            expect(registerUserOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(registerUserOhsUseCase.execute).toHaveBeenCalledWith(input);
        });
    });

    describe("validateUserById", () => {
        it("should validate that the user exists", async () => {
            const { userApi, getUserByIdOhsUseCase } = makeSut();
            await userApi.validateUserById("user-id");
            expect(getUserByIdOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(getUserByIdOhsUseCase.execute).toHaveBeenCalledWith("user-id");
        });

        it("should propagate user validation errors", async () => {
            const { userApi, getUserByIdOhsUseCase } = makeSut();
            getUserByIdOhsUseCase.execute.mockRejectedValue(new Error("User not found"));
            await expect(userApi.validateUserById("user-id")).rejects.toThrow("User not found");
            expect(getUserByIdOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(getUserByIdOhsUseCase.execute).toHaveBeenCalledWith("user-id");
        });
    });

    describe("delete", () => {
        it("should delete a user successfully", async () => {
            const { userApi, deleteUserOhsUseCase } = makeSut();
            const output: DeleteUserResultDto = { id: "user-id" };
            deleteUserOhsUseCase.execute.mockResolvedValue(output);
            const result = await userApi.delete("user-id");
            expect(deleteUserOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(deleteUserOhsUseCase.execute).toHaveBeenCalledWith("user-id");
            expect(result).toEqual(output);
        });

        it("should propagate user deletion errors", async () => {
            const { userApi, deleteUserOhsUseCase } = makeSut();
            deleteUserOhsUseCase.execute.mockRejectedValue(new Error("User not found"));
            await expect(userApi.delete("user-id")).rejects.toThrow("User not found");
            expect(deleteUserOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(deleteUserOhsUseCase.execute).toHaveBeenCalledWith("user-id");
        });
    });

    describe("getUserById", () => {
        it("should get a user successfully and map the email value", async () => {
            const { userApi, getUserByIdOhsUseCase } = makeSut();
            const user = {
                id: "user-id",
                firstName: "John",
                lastName: "Doe",
                email: { value: "john.doe@example.com" },
                tenantId: "tenant-id",
                roleId: "role-id",
            };
            getUserByIdOhsUseCase.execute.mockResolvedValue(user);
            const result = await userApi.getUserById("user-id");
            expect(getUserByIdOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(getUserByIdOhsUseCase.execute).toHaveBeenCalledWith("user-id");
            expect(result).toEqual({
                id: "user-id",
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                tenantId: "tenant-id",
                roleId: "role-id",
            });
        });

        it("should propagate user retrieval errors", async () => {
            const { userApi, getUserByIdOhsUseCase } = makeSut();
            getUserByIdOhsUseCase.execute.mockRejectedValue(new Error("User not found"));
            await expect(userApi.getUserById("user-id")).rejects.toThrow("User not found");
            expect(getUserByIdOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(getUserByIdOhsUseCase.execute).toHaveBeenCalledWith("user-id");
        });
    });

    describe("DTO", () => {
        it("should create a register user request dto", () => {
            const dto = new RegisterUserRequestDto();
            dto.firstName = "John";
            dto.lastName = "Doe";
            dto.email = "john.doe@example.com";
            dto.tenantId = "tenant-id";
            dto.roleId = "role-id";
            expect(dto).toEqual({
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                tenantId: "tenant-id",
                roleId: "role-id",
            });
        });

        it("should create a register user result dto", () => {
            const dto = new RegisterUserResultDto();
            dto.id = "user-id";
            expect(dto).toEqual({ id: "user-id" });
        });

        it("should create a delete user result dto", () => {
            const dto = new DeleteUserResultDto();
            dto.id = "user-id";
            expect(dto).toEqual({ id: "user-id" });
        });

        it("should create a get user request dto", () => {
            const dto = new GetUserRequestDto();
            dto.id = "user-id";
            dto.firstName = "John";
            dto.lastName = "Doe";
            dto.email = "john.doe@example.com";
            dto.tenantId = "tenant-id";
            dto.roleId = "role-id";
            dto.status = "ACTIVE";
            dto.createdAt = new Date("2026-01-01T00:00:00.000Z");
            dto.updatedAt = new Date("2026-01-02T00:00:00.000Z");
            dto.suspendedAt = null;
            expect(dto).toEqual({
                id: "user-id",
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                tenantId: "tenant-id",
                roleId: "role-id",
                status: "ACTIVE",
                createdAt: new Date("2026-01-01T00:00:00.000Z"),
                updatedAt: new Date("2026-01-02T00:00:00.000Z"),
                suspendedAt: null,
            });
        });
    });
});
