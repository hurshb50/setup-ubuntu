import fs from "fs/promises";
import path from "path";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

export class Wallpapers implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Wallpapers");
        context.logger.add(task);
        task.start();

        const dependencies = ["hydrapaper"];
        const isInstalled = await context.dependencyManager.isInstalled(dependencies);

        if (!isInstalled) {
            task.continue("Update package manager");
            await context.dependencyManager.update(task);

            task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
            await context.dependencyManager.install(dependencies, task);
        }

        const sourceDirectoryPath = path.join(context.directories.assets, "wallpapers");
        const destinationDirectoryPath = path.join(context.directories.home, ".local", "share", "backgrounds");

        task.continue("Create backgrounds directory");
        await fs.mkdir(destinationDirectoryPath, { recursive: true });

        task.continue("Copy wallpapers");
        await fs.cp(sourceDirectoryPath, destinationDirectoryPath, { recursive: true });

        task.finish();
    }
}
