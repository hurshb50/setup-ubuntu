import fs from "fs/promises";
import path from "path";
import util from "util";
import childProcess from "child_process";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

export class TerminalView implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Terminal View");
        context.logger.add(task);
        task.start();

        const commandExists = await context.dependencyManager.commandExists("oh-my-posh");

        if (!commandExists) {
            task.continue("Update package manager");
            await context.dependencyManager.update(task);

            const dependencies = ["unzip"];
            task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
            await context.dependencyManager.install(dependencies, task);

            task.continue("Install oh-my-posh");
            const exec = util.promisify(childProcess.exec);
            await exec("curl -s https://ohmyposh.dev/install.sh | bash -s");
        }

        const sourceFilePath = path.join(context.directories.assets, "oh-my-posh.toml");
        const destinationDirectoryPath = path.join(context.directories.home, ".config", "oh-my-posh");
        const destinationFilePath = path.join(destinationDirectoryPath, "oh-my-posh.toml");

        task.continue("Create configuration directory");
        await fs.mkdir(destinationDirectoryPath, { recursive: true });

        task.continue("Copy configuration");
        await fs.copyFile(sourceFilePath, destinationFilePath);

        task.finish();
    }
}
