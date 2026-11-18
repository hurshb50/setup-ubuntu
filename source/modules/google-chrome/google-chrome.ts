import fs from "fs/promises";
import path from "path";
import util from "util";
import childProcess from "child_process";
import type { InstallContext, LegacyPackage } from "../package/package";
import { Task } from "../task/task";

const dependencies = ["google-chrome-stable"];

const systemPaths = [
    path.join("/", "usr", "share", "keyrings", "google-chrome.gpg"),
    path.join("/", "etc", "apt", "sources.list.d", "google-chrome.list"),
    path.join("/", "etc", "apt", "sources.list.d", "google-chrome.sources"),
    path.join("/", "etc", "apt", "trusted.gpg.d", "google-chrome.gpg"),
    path.join("/", "etc", "opt", "chrome"),
    path.join("/", "opt", "google", "chrome"),
];

// Replaced by Brave. Earlier releases installed Chrome from Google's apt repository.
export class GoogleChrome implements LegacyPackage {
    async isInstalled(context: InstallContext): Promise<boolean> {
        if (await context.dependencyManager.isInstalled(dependencies)) return true;

        const statistics = await Promise.all(
            systemPaths.map((systemPath) => fs.stat(systemPath, { throwIfNoEntry: false })),
        );

        return statistics.some((statistic) => statistic !== undefined);
    }

    async uninstall(context: InstallContext): Promise<void> {
        const task = new Task("Remove Google Chrome");
        context.logger.add(task);
        task.start();

        task.continue("Remove Google Chrome");
        await context.dependencyManager.purge(dependencies, task);

        task.continue("Remove Google Chrome sources");
        const exec = util.promisify(childProcess.exec);
        await exec(`sudo rm -rf ${systemPaths.join(" ")}`);

        task.continue("Remove user data");
        const userDataPaths = [
            path.join(context.directories.home, ".config", "google-chrome"),
            path.join(context.directories.home, ".cache", "google-chrome"),
        ];

        await Promise.all(userDataPaths.map((userDataPath) => fs.rm(userDataPath, { recursive: true, force: true })));

        task.finish();
    }
}
