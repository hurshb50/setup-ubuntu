import fs from "fs/promises";
import path from "path";
import util from "util";
import childProcess from "child_process";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

export class CodeEditor implements Package {
    async isInstalled(context: InstallContext): Promise<boolean> {
        return context.dependencyManager.commandExists("zed");
    }

    async install(context: InstallContext): Promise<void> {
        const task = new Task("Code Editor");
        context.logger.add(task);
        task.start();

        const sourceDirectoryPath = path.join(context.directories.assets, "zed");
        const destinationDirectoryPath = path.join(context.directories.home, ".config", "zed");

        task.continue("Install Zed");
        const commandExists = await this.isInstalled(context);

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

    async uninstall(context: InstallContext): Promise<void> {
        const task = new Task("Remove Code Editor");
        context.logger.add(task);
        task.start();

        const home = context.directories.home;

        // These match the paths created by https://zed.dev/install.sh.
        task.continue("Remove Zed");
        const applicationPaths = [
            path.join(home, ".local", "zed.app"),
            path.join(home, ".local", "bin", "zed"),
            path.join(home, ".local", "share", "applications", "dev.zed.Zed.desktop"),
        ];

        await Promise.all(applicationPaths.map((filePath) => fs.rm(filePath, { recursive: true, force: true })));

        task.continue("Remove user data");
        const userDataPaths = [
            path.join(home, ".config", "zed"),
            path.join(home, ".local", "share", "zed"),
            path.join(home, ".cache", "zed"),
        ];

        await Promise.all(userDataPaths.map((filePath) => fs.rm(filePath, { recursive: true, force: true })));

        task.finish();
    }
}
