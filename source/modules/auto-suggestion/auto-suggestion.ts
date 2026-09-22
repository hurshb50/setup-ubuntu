import fs from "fs/promises";
import os from "os";
import path from "path";
import { execa } from "execa";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

export class AutoSuggestion implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Auto Suggestion");
        context.logger.add(task);
        task.start();

        const destinationDirectoryPath = path.join(context.directories.home, ".local", "share");
        const installedFilePath = path.join(destinationDirectoryPath, "blesh", "ble.sh");
        const sourceFilePath = path.join(context.directories.assets, ".blerc");
        const destinationFilePath = path.join(context.directories.home, ".blerc");
        const statistics = await fs.stat(installedFilePath, { throwIfNoEntry: false });
        const isInstalled = statistics !== undefined;

        if (!isInstalled) {
            task.continue("Update package manager");
            await context.dependencyManager.update(task);

            const dependencies = ["xz-utils"];
            task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
            await context.dependencyManager.install(dependencies, task);

            const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), "ble.sh"));
            const installationFilePath = path.join(temporaryDirectoryPath, "ble-nightly", "ble.sh");

            task.continue("Download ble.sh");

            await execa(
                `curl -L https://github.com/akinomyoga/ble.sh/releases/download/nightly/ble-nightly.tar.xz | tar xJf - -C ${temporaryDirectoryPath}`,
                { shell: true },
            );

            task.continue("Install ble.sh");
            await execa(`bash ${installationFilePath} --install ${destinationDirectoryPath}`, { shell: true });

            task.continue("Remove temporary directory");
            await fs.rm(temporaryDirectoryPath, { recursive: true });
        }

        task.continue("Copy configuration");
        await fs.copyFile(sourceFilePath, destinationFilePath);

        task.finish();
    }
}
