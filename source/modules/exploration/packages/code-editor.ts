import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Package } from "../package";
import type { TaskLogger } from "../task-logger";
import { execAsync } from "../../exec-async";

export class CodeEditor implements Package {
    async setupSystemSources(): Promise<void> {
        const homeDirectoryPath = os.homedir();
        const homeShellConfigurationFilePath = path.join(homeDirectoryPath, ".bashrc");
        await fs.access(homeShellConfigurationFilePath);
    }

    async postSystemInstall(taskLogger: TaskLogger): Promise<void> {
        const taskId = taskLogger.registerTask("Setup Code Editor");

        try {
            taskLogger.startTask(taskId);

            const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
            const zedDirectoryPath = path.join(assetsDirectoryPath, "zed");
            const homeDirectoryPath = os.homedir();
            const configurationDirectoryPath = path.join(homeDirectoryPath, ".config");
            const configurationZedDirectoryPath = path.join(configurationDirectoryPath, "zed");

            taskLogger.updateTaskStep(taskId, "Install Zed");
            await execAsync("curl -f https://zed.dev/install.sh | sh");

            taskLogger.updateTaskStep(taskId, "Copy configuration");
            await fs.cp(zedDirectoryPath, configurationZedDirectoryPath, { recursive: true });

            taskLogger.finishTask(taskId);
        } catch {
            taskLogger.failTask(taskId);
        }
    }
}
