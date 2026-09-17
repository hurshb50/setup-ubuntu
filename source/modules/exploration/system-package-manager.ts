import childProcess from "node:child_process";
import type { TaskLogger } from "./task-logger";

/**
 * Need the following:
 * - prequisite package installs
 * - package sources
 * - update
 * - install packages
 */
class SystemPackageManager {
    systemPackages: SystemPackage[];
    taskLogger: TaskLogger;

    constructor(systemPackages: SystemPackage[], taskLogger: TaskLogger) {
        this.systemPackages = systemPackages;
        this.taskLogger = taskLogger;
    }

    installPrequisites(): void {
        const dependencies: string[] = [];
        const taskId = this.taskLogger.registerTask("Install Prerequisite System Dependencies");
        this.taskLogger.startTask(taskId);

        try {
            for (const systemPackage of this.systemPackages) dependencies.push(...systemPackage.dependencies);

            const installCommand = `sudo apt-get install ${dependencies.join(" ")}`;
            childProcess.execSync(installCommand);
            this.taskLogger.finishTask(taskId);
        } catch {
            this.taskLogger.failTask(taskId);
        }
    }

    setupSources(): void {
        const taskId = this.taskLogger.registerTask("Setup System Sources");
        this.taskLogger.startTask(taskId);

        try {
            for (const systemPackage of this.systemPackages) systemPackage.setupSources();

            this.taskLogger.finishTask(taskId);
        } catch {
            this.taskLogger.failTask(taskId);
        }
    }

    installPackages(): void {
        const packageNames = this.systemPackages.map(({ name }) => name);
        const taskId = this.taskLogger.registerTask("Install System Packages");
        this.taskLogger.startTask(taskId);

        try {
            const installCommand = `sudo apt-get install ${packageNames.join(" ")}`;
            childProcess.execSync(installCommand);
            this.taskLogger.finishTask(taskId);
        } catch {
            this.taskLogger.failTask(taskId);
        }
    }

    async postInstall(): Promise<void> {
        const taskId = this.taskLogger.registerTask("Post Install System Packages");
        this.taskLogger.startTask(taskId);

        try {
            const postInstallCalls = this.systemPackages.map(({ postInstall }) => postInstall());
            await Promise.all(postInstallCalls);
            this.taskLogger.finishTask(taskId);
        } catch {
            this.taskLogger.failTask(taskId);
        }
    }
}

interface SystemPackage {
    dependencies: string[]; // sometimes not defined
    name: string; // sometimes not defined
    setupSources: () => void; // sometimes not defined
    postInstall: () => Promise<void>; // sometimes not defined
}
