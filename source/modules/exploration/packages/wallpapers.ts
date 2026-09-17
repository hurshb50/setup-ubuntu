import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Package } from "../package";
import type { TaskLogger } from "../task-logger";

export class Wallpapers implements Package {
    systemDependencyNames = ["hydrapaper"];

    async postSystemInstall(taskLogger: TaskLogger): Promise<void> {
        const taskId = taskLogger.registerTask("Setup Wallpapers");

        try {
            taskLogger.startTask(taskId);
            const homeDirectoryPath = os.homedir();
            const backgroundsDirectoryPath = path.join(homeDirectoryPath, ".local", "share", "backgrounds");
            const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
            const wallpapersDirectoryPath = path.join(assetsDirectoryPath, "wallpapers");
            taskLogger.updateTaskStep(taskId, "Create backgrounds directory");
            await fs.mkdir(backgroundsDirectoryPath, { recursive: true });
            taskLogger.updateTaskStep(taskId, "Copy wallpapers");
            await fs.cp(wallpapersDirectoryPath, backgroundsDirectoryPath, { recursive: true });
            taskLogger.finishTask(taskId);
        } catch {
            taskLogger.failTask(taskId);
        }
    }
}
