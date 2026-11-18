import fs from "fs/promises";
import path from "path";
import util from "util";
import childProcess from "child_process";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

const keyringFilePath = path.join("/", "usr", "share", "keyrings", "brave-browser-archive-keyring.gpg");
const sourceFilePath = path.join("/", "etc", "apt", "sources.list.d", "brave-browser-release.sources");
const configurationFilePath = path.join("/", "etc", "apt", "apt.conf.d", "51unattended-upgrades-brave");

export class Browser implements Package {
    async isInstalled(context: InstallContext): Promise<boolean> {
        return context.dependencyManager.isInstalled(["brave-browser"]);
    }

    async install(context: InstallContext): Promise<void> {
        const task = new Task("Browser");
        context.logger.add(task);
        task.start();

        const dependencies = ["brave-browser"];
        const isInstalled = await this.isInstalled(context);

        const sourceFilePaths = [keyringFilePath, sourceFilePath];
        const sourceFilesExist = (
            await Promise.all(
                sourceFilePaths.map(async (filePath) => {
                    const statistics = await fs.stat(filePath, { throwIfNoEntry: false });
                    return statistics !== undefined && statistics.size > 0;
                }),
            )
        ).every(Boolean);

        if (!isInstalled || !sourceFilesExist) {
            task.continue("Update package manager");
            await context.dependencyManager.update(task);

            const systemDependencies = ["curl", "unattended-upgrades"];
            task.continue(`Installing dependencies: ${systemDependencies.join(", ")}`);
            await context.dependencyManager.install(systemDependencies, task);

            task.continue("Set up Brave sources");
            const exec = util.promisify(childProcess.exec);

            await exec(
                `sudo curl -fsSLo ${keyringFilePath} https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg`,
            );

            await exec(
                `sudo curl -fsSLo ${sourceFilePath} https://brave-browser-apt-release.s3.brave.com/brave-browser.sources`,
            );

            await exec(`sudo rm -f /etc/apt/sources.list.d/brave-browser-*.list`);

            task.continue("Update package manager");
            await context.dependencyManager.update(task);

            if (!isInstalled) {
                task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
                await context.dependencyManager.install(dependencies, task);
            }
        }

        await this.configureAutomaticUpdates(context, task);

        task.finish();
    }

    async uninstall(context: InstallContext): Promise<void> {
        const task = new Task("Remove Browser");
        context.logger.add(task);
        task.start();

        task.continue("Remove Brave");
        await context.dependencyManager.purge(["brave-browser", "brave-keyring"], task);

        task.continue("Remove Brave sources");
        const exec = util.promisify(childProcess.exec);

        await exec(
            `sudo rm -f ${keyringFilePath} ${sourceFilePath} ${configurationFilePath} /etc/apt/sources.list.d/brave-browser-*.list`,
        );

        task.continue("Remove user data");
        const userDataPaths = [
            path.join(context.directories.home, ".config", "BraveSoftware"),
            path.join(context.directories.home, ".cache", "BraveSoftware"),
        ];

        await Promise.all(userDataPaths.map((userDataPath) => fs.rm(userDataPath, { recursive: true, force: true })));

        task.finish();
    }

    private async configureAutomaticUpdates(context: InstallContext, task: Task): Promise<void> {
        const dependencies = ["unattended-upgrades"];
        const isInstalled = await context.dependencyManager.isInstalled(dependencies);

        if (!isInstalled) {
            task.continue("Update package manager");
            await context.dependencyManager.update(task);

            task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
            await context.dependencyManager.install(dependencies, task);
        }

        task.continue("Configure automatic updates");
        const exec = util.promisify(childProcess.exec);

        await exec(
            `printf '%s\\n' 'Unattended-Upgrade::Allowed-Origins {' '    "Brave Software:stable";' '};' | sudo tee ${configurationFilePath} > /dev/null`,
        );
    }
}
