import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Package } from "../package";
import type { TaskLogger } from "../task-logger";

export class ShellConfiguration implements Package {
    async postSystemInstall(taskLogger: TaskLogger): Promise<void> {
        const taskId = taskLogger.registerTask("Setup Shell Configuration");

        try {
            taskLogger.startTask(taskId);
            const homeDirectoryPath = os.homedir();
            const homeShellConfigurationFilePath = path.join(homeDirectoryPath, ".bashrc");
            const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
            const sourceShellConfigurationPath = path.join(assetsDirectoryPath, ".bashrc");

            taskLogger.updateTaskStep(taskId, "Copy shell configuration");
            await fs.copyFile(sourceShellConfigurationPath, homeShellConfigurationFilePath);

            taskLogger.finishTask(taskId);
        } catch {
            taskLogger.failTask(taskId);
        }
    }
}
