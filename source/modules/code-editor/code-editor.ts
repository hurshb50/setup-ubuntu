import fs from "fs/promises";
import path from "path";
import { execa } from "execa";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

export class CodeEditor implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Code Editor");
        context.logger.add(task);
        task.start();

        const sourceDirectoryPath = path.join(context.directories.assets, "zed");
        const destinationDirectoryPath = path.join(context.directories.home, ".config", "zed");

        task.continue("Install Zed");
        const commandExists = await context.dependencyManager.commandExists("zed");

        if (!commandExists) {
            await execa("curl -f https://zed.dev/install.sh | sh", { shell: true });
        }

        task.continue("Copy configuration");
        
        await fs.cp(sourceDirectoryPath, destinationDirectoryPath, {
            recursive: true,
            dereference: true,
        });

        task.finish();
    }
}
