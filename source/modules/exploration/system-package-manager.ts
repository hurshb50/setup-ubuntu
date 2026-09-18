import childProcess from "node:child_process";
import type { Package } from "./package";
import { Task } from "./task";
import type { Logger } from "./ta./logger

export class SystemPackageManager {
    packages: Package[];
    logger: Logger;

    constructor(packages: Package[], logger: Logger) {
        this.packages = packages;
        this.logger = logger;
    }

    installPrequisites(): void {
        const task = new Task("Install System Dependencies");
        this.logger.add(task);
        task.start();

        const systemDependencyNames = this.packages.flatMap(({ systemDependencyNames }) => systemDependencyNames ?? []);

        const installCommand = `sudo apt-get install --yes --no-install-recommends ${systemDependencyNames.join(" ")}`;
        childProcess.execSync(installCommand);
        task.finish();
    }

    async setupSources(): Promise<void> {
        const task = new Task("Setup System Sources");
        this.logger.add(task);
        task.start();

        for (const systemPackage of this.packages) await systemPackage.setupSystemSources?.();

        task.finish();
    }

    updateSystemPackageManager(): void {
        const task = new Task("Update System Package Manager");
        this.logger.add(task);
        task.start();

        childProcess.execSync("sudo DEBIAN_FRONTEND=noninteractive apt-get update --yes");
        task.finish();
    }

    installPackages(): void {
        const task = new Task("Install System Packages");
        this.logger.add(task);
        task.start();

        const systemNames = this.packages.flatMap(({ systemName }) => systemName ?? []);
        const installCommand = `sudo apt-get install --yes --no-install-recommends ${systemNames.join(" ")}`;
        childProcess.execSync(installCommand);
        task.finish();
    }

    async postSystemInstall(): Promise<void> {
        const postSystemInstallCalls = this.packages.map((systemPackage) =>
            systemPackage.postSystemInstall(this.logger),
        );

        await Promise.all(postSystemInstallCalls);
    }
}
