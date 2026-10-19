import type { PaginationInput } from "@/shared/pagination";

import type { NotificationChannel } from "../notification";

export type NotificationTemplateProps = {
    id: string;
    tenantId: string | null;
    code: string;
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
