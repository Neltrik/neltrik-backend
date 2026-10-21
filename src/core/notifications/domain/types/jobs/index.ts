import type { JobPayload } from "@/shared/jobs";

export const SEND_NOTIFICATION_QUEUE = "notifications";
export const SEND_NOTIFICATION_JOB = "send-notification";

export type SendNotificationJobPayload = JobPayload & {
    notificationId: string;
};
