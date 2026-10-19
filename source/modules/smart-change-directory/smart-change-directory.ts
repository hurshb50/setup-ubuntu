import fs from "fs/promises";
import path from "path";
import util from "util";
import childProcess from "child_process";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

export class SmartChangeDirectory implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Smart Change Directory");
        context.logger.add(task);
        task.start();

        const binaryDirectoryPath = path.join(context.directories.home, ".local", "bin");
        const binaryFilePath = path.join(binaryDirectoryPath, "zoxide");
        const statistics = await fs.stat(binaryFilePath, { throwIfNoEntry: false });
        const isInstalled = statistics !== undefined;

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
}
