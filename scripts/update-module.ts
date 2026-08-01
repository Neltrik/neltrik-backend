import fs from "node:fs";
import path from "node:path";

import { MODULE_FOLDERS, MODULE_TARGETS } from "./constants/modules";
import { CliMessages } from "./messages/cli.messages";

const root = process.cwd();

for (const target of Object.values(MODULE_TARGETS)) {
    const targetPath = path.join(root, "src", target);
    if (!fs.existsSync(targetPath)) {
        continue;
    }
    const modules = fs.readdirSync(targetPath, { withFileTypes: true }).filter((entry) => entry.isDirectory());
    for (const module of modules) {
        const modulePath = path.join(targetPath, module.name);
        console.log(CliMessages.updating(target, module.name));
        for (const folder of MODULE_FOLDERS) {
            const folderPath = path.join(modulePath, folder);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
                console.log(CliMessages.createdFolder(folder));
            }
        }
    }
}
console.log(CliMessages.updated());
