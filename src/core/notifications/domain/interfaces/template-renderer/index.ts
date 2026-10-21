import type { NotificationPayload } from "../../types";

export abstract class TemplateRenderer {
    abstract render(template: string, payload: NotificationPayload): string;
}
