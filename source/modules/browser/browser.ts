import path from "path";
import util from "util";
import childProcess from "child_process";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

export class Browser implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Browser");
        context.logger.add(task);
        task.start();

        const dependencies = ["google-chrome-stable"];
        const isInstalled = await context.dependencyManager.isInstalled(dependencies);

        if (isInstalled) {
            task.finish();
            return;
        }

        task.continue("Update package manager");
        await context.dependencyManager.update(task);

        const systemDependencies = ["gnupg"];
        task.continue(`Installing dependencies: ${systemDependencies.join(", ")}`);
        await context.dependencyManager.install(systemDependencies, task);

        const keyringFilePath = path.join("/", "usr", "share", "keyrings", "google-chrome.gpg");
        const sourceFilePath = path.join("/", "etc", "apt", "sources.list.d", "google-chrome.list");

        task.continue("Set up google chrome sources");
        const exec = util.promisify(childProcess.exec);

        await exec(
            `curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | sudo gpg --dearmor --yes -o ${keyringFilePath}`,
        );

        await exec(
            `echo 'deb [arch=amd64 signed-by=${keyringFilePath}] http://dl.google.com/linux/chrome/deb/ stable main' | sudo tee ${sourceFilePath} > /dev/null`,
        );

        task.continue("Update package manager");
        await context.dependencyManager.update(task);

        task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
        await context.dependencyManager.install(dependencies, task);

        task.finish();
    }
}
