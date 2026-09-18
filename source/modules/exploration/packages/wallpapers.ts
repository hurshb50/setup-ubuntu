import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Package } from "../package";
import { Task } from "../task";
import type { TaskLogger } from "../task-logger";

export class Wallpapers implements Package {
    systemDependencyNames = ["hydrapaper"];

    async postSystemInstall(logger: TaskLogger): Promise<void> {
        const task = new Task("Setup Wallpapers");
        logger.add(task);
        task.start();

        try {
            const homeDirectoryPath = os.homedir();
            const backgroundsDirectoryPath = path.join(homeDirectoryPath, ".local", "share", "backgrounds");
            const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
            const wallpapersDirectoryPath = path.join(assetsDirectoryPath, "wallpapers");
            task.continue("Create backgrounds directory");
            await fs.mkdir(backgroundsDirectoryPath, { recursive: true });
            task.continue("Copy wallpapers");
            await fs.cp(wallpapersDirectoryPath, backgroundsDirectoryPath, { recursive: true });
            task.finish();
        } catch (error) {
            task.fail(error);
        }
    }
}
