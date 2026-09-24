import fs from "fs/promises";
import path from "path";
import util from "util";
import childProcess from "child_process";
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
            const exec = util.promisify(childProcess.exec);
            await exec("curl -f https://zed.dev/install.sh | sh");
        }

        task.continue("Copy configuration");

        await fs.cp(sourceDirectoryPath, destinationDirectoryPath, {
            recursive: true,
            dereference: true,
        });

        task.finish();
    }
}
