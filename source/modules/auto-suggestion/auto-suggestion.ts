import fs from "fs/promises";
import os from "os";
import path from "path";
import util from "util";
import childProcess from "child_process";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

export class AutoSuggestion implements Package {
    async isInstalled(context: InstallContext): Promise<boolean> {
        const installedFilePath = path.join(context.directories.home, ".local", "share", "blesh", "ble.sh");
        const statistics = await fs.stat(installedFilePath, { throwIfNoEntry: false });
        return statistics !== undefined;
    }

    async install(context: InstallContext): Promise<void> {
        const task = new Task("Auto Suggestion");
        context.logger.add(task);
        task.start();

        const destinationDirectoryPath = path.join(context.directories.home, ".local", "share");
        const sourceFilePath = path.join(context.directories.assets, ".blerc");
        const destinationFilePath = path.join(context.directories.home, ".blerc");
        const isInstalled = await this.isInstalled(context);

        if (!isInstalled) {
            task.continue("Update package manager");
            await context.dependencyManager.update(task);

            const dependencies = ["xz-utils"];
            task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
            await context.dependencyManager.install(dependencies, task);

            const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), "ble.sh"));
            const installationFilePath = path.join(temporaryDirectoryPath, "ble-nightly", "ble.sh");

            task.continue("Download ble.sh");
            const exec = util.promisify(childProcess.exec);

            await exec(
                `curl -L https://github.com/akinomyoga/ble.sh/releases/download/nightly/ble-nightly.tar.xz | tar xJf - -C ${temporaryDirectoryPath}`,
            );

            task.continue("Install ble.sh");
            await exec(`bash ${installationFilePath} --install ${destinationDirectoryPath}`);

            task.continue("Remove temporary directory");
            await fs.rm(temporaryDirectoryPath, { recursive: true });
        }

        task.continue("Copy configuration");
        await fs.copyFile(sourceFilePath, destinationFilePath);

        task.finish();
    }

    async uninstall(context: InstallContext): Promise<void> {
        const task = new Task("Remove Auto Suggestion");
        context.logger.add(task);
        task.start();

        const home = context.directories.home;

        task.continue("Remove ble.sh");
        const filePaths = [
            path.join(home, ".local", "share", "blesh"),
            path.join(home, ".cache", "blesh"),
            path.join(home, ".local", "state", "blesh"),
            path.join(home, ".blerc"),
        ];

        await Promise.all(filePaths.map((filePath) => fs.rm(filePath, { recursive: true, force: true })));

        task.finish();
    }
}
