import { env } from "@/config/index";
import { LOCALES, NOTIFICATION_CHANNEL, NOTIFICATION_CODES } from "@/core/notifications/api";
import { type OutboxEventRecord } from "@/shared/outbox";

import { NotificationApiSpy, TenantApiSpy, UserApiSpy } from "../../../test-doubles";
import { SendInvitationEmailOutboxHandler } from "./index";

const makeSut = () => {
    const userApi = new UserApiSpy();
    userApi.getUserById.mockResolvedValueOnce({
        id: "inviter-user-id",
        firstName: "John",
        lastName: "Doe",
        email: "john@company.com",
        createdAt: new Date(),
        roleId: "",
        status: "ACTIVE",
        suspendedAt: new Date(),
        tenantId: "",
        updatedAt: new Date(),
    });
    userApi.getUserById.mockResolvedValue({
        id: "user-id",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@company.com",
        createdAt: new Date(),
        roleId: "",
        status: "ACTIVE",
        suspendedAt: new Date(),
        tenantId: "",
        updatedAt: new Date(),
    });
    const tenantApi = new TenantApiSpy();
    tenantApi.getById.mockResolvedValue({
        id: "tenant-id",
        name: "Acme Corporation",
        createdAt: new Date(),
        status: "ACTIVE",
        suspendedAt: new Date(),
        updatedAt: new Date(),
        slug: "",
        type: "CUSTOMER",
    });
    const notificationApi = new NotificationApiSpy();
    notificationApi.send.mockResolvedValue("notification-id");
    const handler = new SendInvitationEmailOutboxHandler(userApi, notificationApi, tenantApi);
    return { handler, userApi, tenantApi, notificationApi };
};

const makeEvent = (): OutboxEventRecord => ({
    id: "event-id",
    eventType: "SEND_INVITATION_EMAIL",
    payload: {
        membershipId: "membership-id",
        userId: "user-id",
        companyName: "Acme Corporation",
        tenantId: "tenant-id",
        inviterUserId: "inviter-user-id",
    },
    attempts: 0,
    createdAt: new Date("2026-01-15T10:30:00.000Z"),
});

describe("SendInvitationEmailOutboxHandler", () => {
    it("should have SEND_INVITATION_EMAIL as event type", () => {
        const { handler } = makeSut();
        expect(handler.eventType).toBe("SEND_INVITATION_EMAIL");
    });

    it("should retrieve inviter, recipient and tenant information", async () => {
        const { handler, userApi, tenantApi } = makeSut();
        await handler.handle(makeEvent());
        expect(userApi.getUserById).toHaveBeenCalledTimes(2);
        expect(userApi.getUserById).toHaveBeenNthCalledWith(1, "inviter-user-id");
        expect(userApi.getUserById).toHaveBeenNthCalledWith(2, "user-id");
        expect(tenantApi.getById).toHaveBeenCalledTimes(1);
        expect(tenantApi.getById).toHaveBeenCalledWith("tenant-id");
    });

    it("should send an invitation email notification with the correct parameters", async () => {
        const { handler, notificationApi } = makeSut();
        await handler.handle(makeEvent());
        expect(notificationApi.send).toHaveBeenCalledTimes(1);
        expect(notificationApi.send).toHaveBeenCalledWith({
            tenantId: "tenant-id",
            recipientId: "user-id",
            recipientEmail: "jane@company.com",
            code: NOTIFICATION_CODES.COMPANY_INVITATION,
            channels: [NOTIFICATION_CHANNEL.EMAIL],
            locale: LOCALES.ES_CO,
            payload: {
                inviterName: "John Doe",
                companyName: "Acme Corporation",
                tenantName: "Acme Corporation",
                invitationUrl: `${env.FRONTEND_URL}/memberships/membership-id/accept`,
            },
        });
    });

    it("should propagate inviter retrieval errors", async () => {
        const { handler, userApi, notificationApi } = makeSut();
        userApi.getUserById.mockRejectedValue(new Error("Inviter not found"));
        await expect(handler.handle(makeEvent())).rejects.toThrow("Inviter not found");
        expect(notificationApi.send).not.toHaveBeenCalled();
    });

    it("should propagate recipient retrieval errors", async () => {
        const { handler, userApi, notificationApi } = makeSut();
        userApi.getUserById
            .mockReset()
            .mockResolvedValueOnce({
                id: "inviter-user-id",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                createdAt: new Date(),
                roleId: "",
                status: "ACTIVE",
                suspendedAt: new Date(),
                tenantId: "",
                updatedAt: new Date(),
            })
            .mockRejectedValueOnce(new Error("Recipient not found"));
        await expect(handler.handle(makeEvent())).rejects.toThrow("Recipient not found");
        expect(notificationApi.send).not.toHaveBeenCalled();
    });

    it("should propagate tenant retrieval errors", async () => {
        const { handler, tenantApi, notificationApi } = makeSut();
        tenantApi.getById.mockRejectedValue(new Error("Tenant not found"));
        await expect(handler.handle(makeEvent())).rejects.toThrow("Tenant not found");
        expect(notificationApi.send).not.toHaveBeenCalled();
    });

    it("should propagate notification sending errors", async () => {
        const { handler, notificationApi } = makeSut();
        notificationApi.send.mockRejectedValue(new Error("Notification failed"));
        await expect(handler.handle(makeEvent())).rejects.toThrow("Notification failed");
        expect(notificationApi.send).toHaveBeenCalledTimes(1);
    });
});
