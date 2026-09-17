import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Package } from "../package";
import type { TaskLogger } from "../task-logger";

export class AgentRules implements Package {
    async postSystemInstall(taskLogger: TaskLogger): Promise<void> {
        const taskId = taskLogger.registerTask("Setup Agent Rules");

        try {
            taskLogger.startTask(taskId);

            const homeDirectoryPath = os.homedir();
            const globalRulesDirectoryPath = path.join(homeDirectoryPath, ".config", "zed");
            const globalRulesFilePath = path.join(globalRulesDirectoryPath, "AGENTS.md");
            const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
            const rulesSourceFilePath = path.join(assetsDirectoryPath, "AGENTS.md");

            taskLogger.updateTaskStep(taskId, "Create global rules directory");
            await fs.mkdir(globalRulesDirectoryPath, { recursive: true });

            taskLogger.updateTaskStep(taskId, "Copy agent rules");
            await fs.copyFile(rulesSourceFilePath, globalRulesFilePath);

            taskLogger.finishTask(taskId);
        } catch {
            taskLogger.failTask(taskId);
        }
    }
}
