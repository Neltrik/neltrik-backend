import type { NotificationTemplate } from "../../../../domain/entities";
import { NotificationTemplateRepositorySpy, TenantApiSpy } from "../../../../test-doubles";
import { ListNotificationTemplatesUseCase } from "./index";
import type { ListNotificationTemplatesInput } from "./input";

jest.mock("sanitize-html", () => jest.fn((html: string) => html));

describe("ListNotificationTemplatesUseCase", () => {
    const makeSut = () => {
        const tenantApi = new TenantApiSpy();
        const notificationTemplateRepository = new NotificationTemplateRepositorySpy();
        const useCase = new ListNotificationTemplatesUseCase(tenantApi, notificationTemplateRepository);
        return { useCase, tenantApi, notificationTemplateRepository };
    };

    const makeInput = (): ListNotificationTemplatesInput => ({
        actorTenantId: "tenant-id",
        cursor: undefined,
        limit: 10,
    });

    const makeTemplate = (id: string, tenantId: string | null = "tenant-id"): NotificationTemplate =>
        ({
            id,
            tenantId,
        }) as NotificationTemplate;

    it("should return all templates when the actor is a platform tenant", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        const templates = [makeTemplate("template-1"), makeTemplate("template-2")];
        tenantApi.isPlatformTenant.mockResolvedValue(true);
        notificationTemplateRepository.findAll.mockResolvedValue(templates);
        const result = await useCase.execute(input);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(notificationTemplateRepository.findAll).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.findAll).toHaveBeenCalledWith({
            cursor: input.cursor,
            limit: input.limit,
        });
        expect(notificationTemplateRepository.findByTenantIncludingGlobal).not.toHaveBeenCalled();
        expect(result.templates).toEqual(templates);
        expect(result.meta).toBeDefined();
    });

    it("should return templates belonging to the actor tenant and global templates when the actor is not a platform tenant", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        const templates = [makeTemplate("template-1", input.actorTenantId), makeTemplate("template-2", null)];
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        notificationTemplateRepository.findByTenantIncludingGlobal.mockResolvedValue(templates);
        const result = await useCase.execute(input);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(notificationTemplateRepository.findByTenantIncludingGlobal).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.findByTenantIncludingGlobal).toHaveBeenCalledWith({
            tenantId: input.actorTenantId,
            cursor: input.cursor,
            limit: input.limit,
        });
        expect(notificationTemplateRepository.findAll).not.toHaveBeenCalled();
        expect(result.templates).toEqual(templates);
        expect(result.meta).toBeDefined();
    });

    it("should return an empty list when no templates are found", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        notificationTemplateRepository.findByTenantIncludingGlobal.mockResolvedValue([]);
        const result = await useCase.execute(input);
        expect(notificationTemplateRepository.findByTenantIncludingGlobal).toHaveBeenCalledTimes(1);
        expect(result.templates).toEqual([]);
        expect(result.meta).toBeDefined();
    });

    it("should pass the cursor and limit to the repository when the actor is a platform tenant", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input: ListNotificationTemplatesInput = { actorTenantId: "tenant-id", cursor: "template-5", limit: 5 };
        tenantApi.isPlatformTenant.mockResolvedValue(true);
        notificationTemplateRepository.findAll.mockResolvedValue([]);
        await useCase.execute(input);
        expect(notificationTemplateRepository.findAll).toHaveBeenCalledWith({
            cursor: input.cursor,
            limit: input.limit,
        });
    });

    it("should pass the cursor and limit to the repository when the actor is not a platform tenant", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input: ListNotificationTemplatesInput = { actorTenantId: "tenant-id", cursor: "template-5", limit: 5 };
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        notificationTemplateRepository.findByTenantIncludingGlobal.mockResolvedValue([]);
        await useCase.execute(input);
        expect(notificationTemplateRepository.findByTenantIncludingGlobal).toHaveBeenCalledWith({
            tenantId: input.actorTenantId,
            cursor: input.cursor,
            limit: input.limit,
        });
    });

    it("should propagate repository errors when finding all templates", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        tenantApi.isPlatformTenant.mockResolvedValue(true);
        notificationTemplateRepository.findAll.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(input)).rejects.toThrow("Database error");
        expect(notificationTemplateRepository.findAll).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.findAll).toHaveBeenCalledWith({
            cursor: input.cursor,
            limit: input.limit,
        });
    });

    it("should propagate repository errors when finding templates by tenant", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        notificationTemplateRepository.findByTenantIncludingGlobal.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(input)).rejects.toThrow("Database error");
        expect(notificationTemplateRepository.findByTenantIncludingGlobal).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.findByTenantIncludingGlobal).toHaveBeenCalledWith({
            tenantId: input.actorTenantId,
            cursor: input.cursor,
            limit: input.limit,
        });
    });

    it("should propagate errors when checking whether the actor is a platform tenant", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        tenantApi.isPlatformTenant.mockRejectedValue(new Error("Tenant API error"));
        await expect(useCase.execute(input)).rejects.toThrow("Tenant API error");
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(notificationTemplateRepository.findAll).not.toHaveBeenCalled();
        expect(notificationTemplateRepository.findByTenantIncludingGlobal).not.toHaveBeenCalled();
    });

    it("should paginate templates when there are more items than the limit", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input: ListNotificationTemplatesInput = { actorTenantId: "tenant-id", cursor: undefined, limit: 2 };
        const templates = [makeTemplate("template-1"), makeTemplate("template-2"), makeTemplate("template-3")];
        tenantApi.isPlatformTenant.mockResolvedValue(true);
        notificationTemplateRepository.findAll.mockResolvedValue(templates);
        const result = await useCase.execute(input);
        expect(result.templates).toHaveLength(2);
        expect(result.meta).toBeDefined();
    });
});
