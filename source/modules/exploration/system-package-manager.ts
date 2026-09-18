import childProcess from "node:child_process";
import type { Package } from "./package";
import { Task } from "./task";
import type { TaskLogger } from "./task-logger";

export class SystemPackageManager {
    packages: Package[];
    logger: TaskLogger;

    constructor(packages: Package[], logger: TaskLogger) {
        this.packages = packages;
        this.logger = logger;
    }

    installPrequisites(): void {
        const task = new Task("Install System Dependencies");
        this.logger.add(task);
        task.start();

        try {
            const systemDependencyNames = this.packages.flatMap(
                ({ systemDependencyNames }) => systemDependencyNames ?? [],
            );

            const installCommand = `sudo apt-get install --yes --no-install-recommends ${systemDependencyNames.join(" ")}`;
            childProcess.execSync(installCommand);
            task.finish();
        } catch (error) {
            task.fail(error);
        }
    }

    async setupSources(): Promise<void> {
        const task = new Task("Setup System Sources");
        this.logger.add(task);
        task.start();

        try {
            for (const systemPackage of this.packages) await systemPackage.setupSystemSources?.();

            task.finish();
        } catch (error) {
            task.fail(error);
        }
    }

    updateSystemPackageManager(): void {
        const task = new Task("Update System Package Manager");
        this.logger.add(task);
        task.start();

        try {
            childProcess.execSync("sudo DEBIAN_FRONTEND=noninteractive apt-get update --yes");
            task.finish();
        } catch (error) {
            task.fail(error);
        }
    }

    installPackages(): void {
        const task = new Task("Install System Packages");
        this.logger.add(task);
        task.start();

        try {
            const systemNames = this.packages.flatMap(({ systemName }) => systemName ?? []);
            const installCommand = `sudo apt-get install --yes --no-install-recommends ${systemNames.join(" ")}`;
            childProcess.execSync(installCommand);
            task.finish();
        } catch (error) {
            task.fail(error);
        }
    }

    async postSystemInstall(): Promise<void> {
        const postSystemInstallCalls = this.packages.map((systemPackage) =>
            systemPackage.postSystemInstall(this.logger),
        );

        await Promise.all(postSystemInstallCalls);
    }
}
