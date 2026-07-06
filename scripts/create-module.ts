/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

import { MODULE_FOLDERS } from "./constants/module-folders";
import { CliMessages } from "./messages/cli.messages";
import { buildModule } from "./templates/module.template";
import { isValidModuleName } from "./utils/validation.utils";

const moduleName = process.argv[2];

console.log(CliMessages.creating(moduleName));

if (!moduleName) {
    console.error(CliMessages.emptyName());
    process.exit(1);
}

if (!isValidModuleName(moduleName)) {
    console.error(CliMessages.invalidName());
    process.exit(1);
}

const modulePath = path.join(process.cwd(), "src", "modules", moduleName);

if (fs.existsSync(modulePath)) {
    console.error(CliMessages.alreadyExists(moduleName, modulePath));
    process.exit(1);
}

const moduleFilePath = path.join(modulePath, `${moduleName}.module.ts`);

fs.mkdirSync(modulePath, {
    recursive: true,
});
for (const folder of MODULE_FOLDERS) {
    fs.mkdirSync(path.join(modulePath, folder), {
        recursive: true,
    });
}
fs.writeFileSync(moduleFilePath, buildModule(moduleName));
console.log(CliMessages.success(moduleName));
