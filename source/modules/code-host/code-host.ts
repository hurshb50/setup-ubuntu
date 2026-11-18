import fs from "fs/promises";
import path from "path";
import util from "util";
import childProcess from "child_process";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

const keyringFilePath = path.join("/", "usr", "share", "keyrings", "github-cli.gpg");
const sourceFilePath = path.join("/", "etc", "apt", "sources.list.d", "github-cli.list");

export class CodeHost implements Package {
    async isInstalled(context: InstallContext): Promise<boolean> {
        return context.dependencyManager.isInstalled(["gh"]);
    }

    async install(context: InstallContext): Promise<void> {
        const task = new Task("Code Host");
        context.logger.add(task);
        task.start();

        const dependencies = ["gh"];
        const isInstalled = await this.isInstalled(context);

        if (isInstalled) {
            task.finish();
            return;
        }

        task.continue("Update package manager");
        await context.dependencyManager.update(task);

        const systemDependencies = ["gnupg"];
        task.continue(`Installing dependencies: ${systemDependencies.join(", ")}`);
        await context.dependencyManager.install(systemDependencies, task);

        task.continue("Set up github cli sources");
        const exec = util.promisify(childProcess.exec);

        await exec(
            `curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.asc | sudo gpg --dearmor --yes -o ${keyringFilePath}`,
        );

        await exec(
            `echo "deb [arch=$(dpkg --print-architecture) signed-by=${keyringFilePath}] https://cli.github.com/packages stable main" | sudo tee ${sourceFilePath} > /dev/null`,
        );

        task.continue("Update package manager");
        await context.dependencyManager.update(task);

        task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
        await context.dependencyManager.install(dependencies, task);

        task.finish();
    }

    async uninstall(context: InstallContext): Promise<void> {
        const task = new Task("Remove Code Host");
        context.logger.add(task);
        task.start();

        task.continue("Remove github cli");
        await context.dependencyManager.purge(["gh"], task);

        task.continue("Remove github cli sources");
        const exec = util.promisify(childProcess.exec);
        await exec(`sudo rm -f ${keyringFilePath} ${sourceFilePath}`);

        task.continue("Remove user data");
        await fs.rm(path.join(context.directories.home, ".config", "gh"), { recursive: true, force: true });

        task.finish();
    }
}
