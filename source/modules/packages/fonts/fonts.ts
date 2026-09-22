import fs from "fs/promises";
import path from "path";
import type { InstallContext, Package } from "../../package/package";
import { Task } from "../../task/task";

export class Fonts implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Fonts");
        context.logger.add(task);
        task.start();

        const dependencies = ["fontconfig"];
        const isInstalled = await context.dependencyManager.isInstalled(dependencies);

        if (!isInstalled) {
            task.continue("Update package manager");
            await context.dependencyManager.update(task);

            task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
            await context.dependencyManager.install(dependencies, task);
        }

        const sourceDirectoryPath = path.join(context.directories.assets, "fonts");
        const destinationDirectoryPath = path.join(context.directories.home, ".local", "share", "fonts");

        task.continue("Create fonts directory");
        await fs.mkdir(destinationDirectoryPath, { recursive: true });

        task.continue("Copy fonts");
        await fs.cp(sourceDirectoryPath, destinationDirectoryPath, { recursive: true });

        task.finish();
    }
}
