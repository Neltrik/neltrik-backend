import { TemplateRenderer } from "../../domain/interfaces";
import type { NotificationPayload } from "../../domain/types";

export class TemplateRendererSpy extends TemplateRenderer {
    public render = jest.fn<string, [string, NotificationPayload]>();
}
