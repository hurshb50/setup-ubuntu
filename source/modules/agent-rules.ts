import fs from "fs/promises";
import os from "os";
import path from "path";

export async function installAgentRules(): Promise<void> {
    console.log("installing agent rules");
    const homeDirectoryPath = os.homedir();
    const globalRulesDirectoryPath = path.join(homeDirectoryPath, ".config", "zed");
    const globalRulesFilePath = path.join(globalRulesDirectoryPath, "AGENTS.md");
    const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
    const rulesSourceFilePath = path.join(assetsDirectoryPath, "AGENTS.md");
    await fs.mkdir(globalRulesDirectoryPath, { recursive: true });
    await fs.copyFile(rulesSourceFilePath, globalRulesFilePath);
    console.log("installed agent rules");
}
