import type { PaginationInput } from "@/shared/pagination";

import { type NotificationCode } from "../../catalogs";
import type { NotificationChannel } from "../notification";

export type NotificationTemplateProps = {
    id: string;
    tenantId: string | null;
    code: NotificationCode;
    channel: NotificationChannel;
    locale: string;
    subject: string | null;
    body: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export interface FindTemplatesByTenantParams extends PaginationInput {
    tenantId: string;
}

export const NOTIFICATION_TEMPLATE_LOCALE_REGEX = /^[a-z]{2}(-[A-Z]{2})?$/;
