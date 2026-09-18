import fs from "fs/promises";
import path from "path";
import type { InstallContext, Package } from "../package";
import { Task } from "../task";

export class ShellConfiguration implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Shell Configuration");
        context.logger.add(task);
        task.start();

        const sourceFilePath = path.join(context.directories.assets, ".bashrc");
        const destinationFilePath = path.join(context.directories.home, ".bashrc");

        task.continue("Copy shell configuration");
        await fs.copyFile(sourceFilePath, destinationFilePath);

        task.finish();
    }
}
