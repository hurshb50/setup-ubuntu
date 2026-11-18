import fs from "fs/promises";
import path from "path";
import util from "util";
import childProcess from "child_process";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

export class SmartChangeDirectory implements Package {
    async isInstalled(context: InstallContext): Promise<boolean> {
        const binaryFilePath = path.join(context.directories.home, ".local", "bin", "zoxide");
        const statistics = await fs.stat(binaryFilePath, { throwIfNoEntry: false });
        return statistics !== undefined;
    }

    async install(context: InstallContext): Promise<void> {
        const task = new Task("Smart Change Directory");
        context.logger.add(task);
        task.start();

        const binaryDirectoryPath = path.join(context.directories.home, ".local", "bin");
        const isInstalled = await this.isInstalled(context);

        if (isInstalled) {
            task.finish();
            return;
        }

        task.continue("Install zoxide");
        const exec = util.promisify(childProcess.exec);
        await exec(
            `curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh -s -- --bin-dir ${binaryDirectoryPath}`,
        );

        task.finish();
    }

    async uninstall(context: InstallContext): Promise<void> {
        const task = new Task("Remove Smart Change Directory");
        context.logger.add(task);
        task.start();

        const home = context.directories.home;

        task.continue("Remove zoxide");
        await fs.rm(path.join(home, ".local", "bin", "zoxide"), { force: true });

        task.continue("Remove manual pages");
        const manualDirectoryPath = path.join(home, ".local", "share", "man", "man1");
        const manualFileNames = await fs.readdir(manualDirectoryPath).catch(() => []);

        await Promise.all(
            manualFileNames
                .filter((fileName) => fileName.startsWith("zoxide"))
                .map((fileName) => fs.rm(path.join(manualDirectoryPath, fileName), { force: true })),
        );

        task.continue("Remove user data");
        await fs.rm(path.join(home, ".local", "share", "zoxide"), { recursive: true, force: true });

        task.finish();
    }
}
