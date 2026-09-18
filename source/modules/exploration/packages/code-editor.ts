import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Package } from "../package";
import { Task } from "../task";
import type { TaskLogger } from "../task-logger";
import { execAsync } from "../../exec-async";

export class CodeEditor implements Package {
    async setupSystemSources(): Promise<void> {
        const homeDirectoryPath = os.homedir();
        const homeShellConfigurationFilePath = path.join(homeDirectoryPath, ".bashrc");
        await fs.access(homeShellConfigurationFilePath);
    }

    async postSystemInstall(logger: TaskLogger): Promise<void> {
        const task = new Task("Setup Code Editor");
        logger.add(task);
        task.start();

        try {
            const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
            const zedDirectoryPath = path.join(assetsDirectoryPath, "zed");
            const homeDirectoryPath = os.homedir();
            const configurationDirectoryPath = path.join(homeDirectoryPath, ".config");
            const configurationZedDirectoryPath = path.join(configurationDirectoryPath, "zed");

            task.continue("Install Zed");
            await execAsync("curl -f https://zed.dev/install.sh | sh");

            task.continue("Copy configuration");
            await fs.cp(zedDirectoryPath, configurationZedDirectoryPath, { recursive: true });

            task.finish();
        } catch (error) {
            task.fail(error);
        }
    }
}
