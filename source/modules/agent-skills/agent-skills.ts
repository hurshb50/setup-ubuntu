import fs from "fs/promises";
import path from "path";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

export class AgentSkills implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Agent Skills");
        context.logger.add(task);
        task.start();

        const destinationDirectoryPath = path.join(context.directories.home, ".agents", "skills");
        const sourceDirectoryPath = path.join(context.directories.assets, "skills");

        task.continue("Create global skills directory");
        await fs.mkdir(destinationDirectoryPath, { recursive: true });

        task.continue("Copy agent skills");

        await fs.cp(sourceDirectoryPath, destinationDirectoryPath, {
            recursive: true,
            dereference: true,
        });

        task.finish();
    }
}
