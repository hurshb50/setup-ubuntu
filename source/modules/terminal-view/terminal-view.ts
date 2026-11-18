import fs from "fs/promises";
import path from "path";
import util from "util";
import childProcess from "child_process";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

export class TerminalView implements Package {
    async isInstalled(context: InstallContext): Promise<boolean> {
        return context.dependencyManager.commandExists("oh-my-posh");
    }

    async install(context: InstallContext): Promise<void> {
        const task = new Task("Terminal View");
        context.logger.add(task);
        task.start();

        const commandExists = await this.isInstalled(context);

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

    async uninstall(context: InstallContext): Promise<void> {
        const task = new Task("Remove Terminal View");
        context.logger.add(task);
        task.start();

        const home = context.directories.home;

        // https://ohmyposh.dev/install.sh installs into ~/bin or ~/.local/bin.
        task.continue("Remove oh-my-posh");
        const filePaths = [
            path.join(home, "bin", "oh-my-posh"),
            path.join(home, ".local", "bin", "oh-my-posh"),
            path.join(home, ".cache", "oh-my-posh"),
            path.join(home, ".config", "oh-my-posh"),
        ];

        await Promise.all(filePaths.map((filePath) => fs.rm(filePath, { recursive: true, force: true })));

        task.finish();
    }
}
