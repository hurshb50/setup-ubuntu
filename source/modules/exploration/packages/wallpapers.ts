import fs from "fs/promises";
import path from "path";
import type { Package, InstallContext } from "../new-package";
import { Task } from "../task";

export class Wallpapers implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Install Wallpapers");
        task.start();
        context.logger.add(task);

        task.continue("Install hydrapaper");
        await context.packageManager.install(["hydrapaper"]);

        task.continue("Create backgrounds directory");
        const backgroundsDirectoryPath = path.join(context.directories.home, ".local", "share", "backgrounds");
        const wallpapersDirectoryPath = path.join(context.directories.assets, "wallpapers");
        await fs.mkdir(backgroundsDirectoryPath, { recursive: true });

        task.continue("Copy wallpapers");
        await fs.cp(wallpapersDirectoryPath, backgroundsDirectoryPath, { recursive: true });

        task.finish();
    }
}
