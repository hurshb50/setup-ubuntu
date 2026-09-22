import fs from "fs/promises";
import path from "path";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

export class AgentRules implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Agent Rules");
        context.logger.add(task);
        task.start();

        const destinationDirectoryPath = path.join(context.directories.home, ".config", "zed");
        const destinationFilePath = path.join(destinationDirectoryPath, "AGENTS.md");
        const sourceFilePath = path.join(context.directories.assets, "AGENTS.md");

        task.continue("Create global rules directory");
        await fs.mkdir(destinationDirectoryPath, { recursive: true });

        task.continue("Copy agent rules");
        await fs.copyFile(sourceFilePath, destinationFilePath);

        task.finish();
    }
}
