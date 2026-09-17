import childProcess from "node:child_process";
import type { Package } from "./package";
import type { TaskLogger } from "./task-logger";

export class SystemPackageManager {
    packages: Package[];
    taskLogger: TaskLogger;

    constructor(packages: Package[], taskLogger: TaskLogger) {
        this.packages = packages;
        this.taskLogger = taskLogger;
    }

    installPrequisites(): void {
        const taskId = this.taskLogger.registerTask("Install System Dependencies");
        this.taskLogger.startTask(taskId);

        try {
            const systemDependencyNames = this.packages.flatMap(
                ({ systemDependencyNames }) => systemDependencyNames ?? [],
            );
            
            const installCommand = `sudo apt-get install --yes --no-install-recommends ${systemDependencyNames.join(" ")}`;
            childProcess.execSync(installCommand);
            this.taskLogger.finishTask(taskId);
        } catch {
            this.taskLogger.failTask(taskId);
        }
    }

    async setupSources(): Promise<void> {
        const taskId = this.taskLogger.registerTask("Setup System Sources");
        this.taskLogger.startTask(taskId);

        try {
            for (const systemPackage of this.packages) await systemPackage.setupSystemSources?.();

            this.taskLogger.finishTask(taskId);
        } catch {
            this.taskLogger.failTask(taskId);
        }
    }

    updateSystemPackageManager(): void {
        const taskId = this.taskLogger.registerTask("Update System Package Manager");
        this.taskLogger.startTask(taskId);

        try {
            childProcess.execSync("sudo DEBIAN_FRONTEND=noninteractive apt-get update --yes");
            this.taskLogger.finishTask(taskId);
        } catch {
            this.taskLogger.failTask(taskId);
        }
    }

    installPackages(): void {
        const taskId = this.taskLogger.registerTask("Install System Packages");
        this.taskLogger.startTask(taskId);

        try {
            const systemNames = this.packages.flatMap(({ systemName }) => systemName ?? []);
            const installCommand = `sudo apt-get install --yes --no-install-recommends ${systemNames.join(" ")}`;
            childProcess.execSync(installCommand);
            this.taskLogger.finishTask(taskId);
        } catch {
            this.taskLogger.failTask(taskId);
        }
    }

    async postSystemInstall(): Promise<void> {
        const postSystemInstallCalls = this.packages.map((systemPackage) =>
            systemPackage.postSystemInstall(this.taskLogger),
        );

        await Promise.all(postSystemInstallCalls);
    }
}
