import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Package } from "../package";
import type { TaskLogger } from "../task-logger";
import { execAsync } from "../../exec-async";

export class AutoSuggestion implements Package {
    systemDependencyNames = ["xz-utils"];

    async postSystemInstall(taskLogger: TaskLogger): Promise<void> {
        const taskId = taskLogger.registerTask("Setup Auto Suggestion");

        try {
            taskLogger.startTask(taskId);

            const systemTemporaryDirectoryPath = os.tmpdir();
            const temporaryDirectoryPathPrefix = path.join(systemTemporaryDirectoryPath, "ble.sh");
            const temporaryDirectoryPath = await fs.mkdtemp(temporaryDirectoryPathPrefix);
            const localShareDirectoryPath = path.join(os.homedir(), ".local", "share");
            const bleshFilePath = path.join(temporaryDirectoryPath, "ble-nightly", "ble.sh");
            const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
            const blercFilePath = path.join(assetsDirectoryPath, ".blerc");
            const homeDirectoryPath = os.homedir();
            const homeBlercFilePath = path.join(homeDirectoryPath, ".blerc");

            taskLogger.updateTaskStep(taskId, "Download ble.sh");
            await execAsync(
                `curl -L https://github.com/akinomyoga/ble.sh/releases/download/nightly/ble-nightly.tar.xz | tar xJf - -C ${temporaryDirectoryPath}`,
            );

            taskLogger.updateTaskStep(taskId, "Install ble.sh");
            await execAsync(`bash ${bleshFilePath} --install ${localShareDirectoryPath}`);

            taskLogger.updateTaskStep(taskId, "Remove temporary directory");
            await fs.rm(temporaryDirectoryPath, { recursive: true });

            taskLogger.updateTaskStep(taskId, "Copy configuration");
            await fs.copyFile(blercFilePath, homeBlercFilePath);

            taskLogger.finishTask(taskId);
        } catch {
            taskLogger.failTask(taskId);
        }
    }
}
