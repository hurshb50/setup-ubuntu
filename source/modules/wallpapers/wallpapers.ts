import fs from "fs/promises";
import path from "path";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

const dependencies = ["hydrapaper"];

export class Wallpapers implements Package {
    async isInstalled(context: InstallContext): Promise<boolean> {
        return context.dependencyManager.isInstalled(dependencies);
    }

    async install(context: InstallContext): Promise<void> {
        const task = new Task("Wallpapers");
        context.logger.add(task);
        task.start();
        const isInstalled = await this.isInstalled(context);

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

        await fs.cp(sourceDirectoryPath, destinationDirectoryPath, {
            recursive: true,
            dereference: true,
        });

        task.finish();
    }

    async uninstall(context: InstallContext): Promise<void> {
        const task = new Task("Remove Wallpapers");
        context.logger.add(task);
        task.start();

        task.continue("Remove hydrapaper");
        await context.dependencyManager.purge(dependencies, task);

        // Only the copied wallpapers are removed, since the directory may hold other backgrounds.
        task.continue("Remove wallpapers");
        const sourceDirectoryPath = path.join(context.directories.assets, "wallpapers");
        const destinationDirectoryPath = path.join(context.directories.home, ".local", "share", "backgrounds");
        const fileNames = await fs.readdir(sourceDirectoryPath);

        await Promise.all(
            fileNames.map((fileName) =>
                fs.rm(path.join(destinationDirectoryPath, fileName), { recursive: true, force: true }),
            ),
        );

        task.finish();
    }
}
