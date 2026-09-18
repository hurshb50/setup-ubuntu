import fs from "fs/promises";
import path from "path";
import type { InstallContext, Package } from "../../package";
import { Task } from "../task";
import { execAsync } from "../../exec-async";

export class CodeEditor implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Code Editor");
        context.logger.add(task);
        task.start();

        const sourceDirectoryPath = path.join(context.directories.assets, "zed");
        const destinationDirectoryPath = path.join(context.directories.home, ".config", "zed");

        task.continue("Install Zed");
        await execAsync("curl -f https://zed.dev/install.sh | sh");

        task.continue("Copy configuration");
        await fs.cp(sourceDirectoryPath, destinationDirectoryPath, { recursive: true });

        task.finish();
    }
}
