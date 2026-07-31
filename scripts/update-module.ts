import fs from "node:fs";
import path from "node:path";

import { MODULE_FILES, MODULE_FOLDERS, MODULE_TARGETS } from "./constants/modules";
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
                fs.mkdirSync(folderPath, {
                    recursive: true,
                });
                console.log(CliMessages.createdFolder(folder));
            }
        }
        for (const file of MODULE_FILES) {
            const filePath = path.join(modulePath, file);
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, "", {
                    flag: "wx",
                });
                console.log(CliMessages.createdFolder(file));
            }
        }
    }
}
console.log(CliMessages.updated());
