import type { Package } from "../package";
import type { TaskLogger } from "../task-logger";

export class VersionControlSystem implements Package {
    systemDependencyNames = ["build-essential"];
    systemName = "git";

    async postSystemInstall(taskLogger: TaskLogger): Promise<void> {
        const taskId = taskLogger.registerTask("Setup Version Control System");

        try {
            taskLogger.startTask(taskId);
            taskLogger.finishTask(taskId);
        } catch {
            taskLogger.failTask(taskId);
        }
    }
}
