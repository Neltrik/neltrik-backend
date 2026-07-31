import fs from "node:fs";
import path from "node:path";

import { MODULE_FILES, MODULE_FOLDERS, MODULE_TARGETS } from "./constants/modules";
import { CliMessages } from "./messages/cli.messages";
import { buildModule } from "./templates/module.template";
import { isValidModuleName } from "./utils/validation.utils";

const moduleName = process.argv[2];
const targetArgument = process.argv.find((arg) => arg.startsWith("--target="));
const target = targetArgument?.replace("--target=", "") ?? "";

if (!moduleName) {
    console.error(CliMessages.emptyName());
    process.exit(1);
}
if (!targetArgument) {
    console.error(CliMessages.emptyTarget());
    process.exit(1);
}
if (!(target in MODULE_TARGETS)) {
    console.error(CliMessages.invalidTarget(Object.keys(MODULE_TARGETS)));
    process.exit(1);
}
if (!isValidModuleName(moduleName)) {
    console.error(CliMessages.invalidName());
    process.exit(1);
}

const modulePath = path.join(process.cwd(), "src", target, moduleName);

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
for (const file of MODULE_FILES) {
    const filePath = path.join(modulePath, file);
    fs.writeFileSync(filePath, "");
}
fs.writeFileSync(moduleFilePath, buildModule(moduleName));
console.log(CliMessages.success(moduleName));
