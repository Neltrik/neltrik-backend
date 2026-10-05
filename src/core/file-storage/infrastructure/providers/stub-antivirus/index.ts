import { Injectable } from "@nestjs/common";

import { AntivirusPort } from "../../../domain/interfaces";
import { AntivirusScan } from "../../../domain/value-objects";

@Injectable()
export class StubAntivirusAdapter extends AntivirusPort {
    public scan(_buffer: Buffer): Promise<AntivirusScan> {
        return Promise.resolve(AntivirusScan.clean("stub", new Date()));
    }
}
