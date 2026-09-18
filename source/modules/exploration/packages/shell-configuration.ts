import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Package } from "../package";
import { Task } from "../task";
import type { TaskLogger } from "../task-logger";

export class ShellConfiguration implements Package {
    async postSystemInstall(logger: TaskLogger): Promise<void> {
        const task = new Task("Setup Shell Configuration");
        logger.add(task);
        task.start();

        const homeDirectoryPath = os.homedir();
        const homeShellConfigurationFilePath = path.join(homeDirectoryPath, ".bashrc");
        const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
        const sourceShellConfigurationPath = path.join(assetsDirectoryPath, ".bashrc");

        task.continue("Copy shell configuration");
        await fs.copyFile(sourceShellConfigurationPath, homeShellConfigurationFilePath);

        task.finish();
    }
}
