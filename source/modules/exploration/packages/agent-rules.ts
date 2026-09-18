import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Package } from "../package";
import { Task } from "../task";
import type { Logger } from "../logger";

export class AgentRules implements Package {
    async postSystemInstall(logger: Logger): Promise<void> {
        const task = new Task("Setup Agent Rules");
        logger.add(task);
        task.start();

        const homeDirectoryPath = os.homedir();
        const globalRulesDirectoryPath = path.join(homeDirectoryPath, ".config", "zed");
        const globalRulesFilePath = path.join(globalRulesDirectoryPath, "AGENTS.md");
        const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
        const rulesSourceFilePath = path.join(assetsDirectoryPath, "AGENTS.md");

        task.continue("Create global rules directory");
        await fs.mkdir(globalRulesDirectoryPath, { recursive: true });

        task.continue("Copy agent rules");
        await fs.copyFile(rulesSourceFilePath, globalRulesFilePath);

        task.finish();
    }
}
