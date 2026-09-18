import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Package } from "../package";
import { Task } from "../task";
import type { TaskLogger } from "../task-logger";
import { execAsync } from "../../exec-async";

export class AutoSuggestion implements Package {
    systemDependencyNames = ["xz-utils"];

    async postSystemInstall(logger: TaskLogger): Promise<void> {
        const task = new Task("Setup Auto Suggestion");
        logger.add(task);
        task.start();

        const systemTemporaryDirectoryPath = os.tmpdir();
        const temporaryDirectoryPathPrefix = path.join(systemTemporaryDirectoryPath, "ble.sh");
        const temporaryDirectoryPath = await fs.mkdtemp(temporaryDirectoryPathPrefix);
        const localShareDirectoryPath = path.join(os.homedir(), ".local", "share");
        const bleshFilePath = path.join(temporaryDirectoryPath, "ble-nightly", "ble.sh");
        const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
        const blercFilePath = path.join(assetsDirectoryPath, ".blerc");
        const homeDirectoryPath = os.homedir();
        const homeBlercFilePath = path.join(homeDirectoryPath, ".blerc");

        task.continue("Download ble.sh");
        await execAsync(
            `curl -L https://github.com/akinomyoga/ble.sh/releases/download/nightly/ble-nightly.tar.xz | tar xJf - -C ${temporaryDirectoryPath}`,
        );

        task.continue("Install ble.sh");
        await execAsync(`bash ${bleshFilePath} --install ${localShareDirectoryPath}`);

        task.continue("Remove temporary directory");
        await fs.rm(temporaryDirectoryPath, { recursive: true });

        task.continue("Copy configuration");
        await fs.copyFile(blercFilePath, homeBlercFilePath);

        task.finish();
    }
}
