import type { Package } from "../package";
import type { TaskLogger } from "../task-logger";

export class FuzzyFinder implements Package {
    systemName = "fzf";

    async postSystemInstall(taskLogger: TaskLogger): Promise<void> {
        const taskId = taskLogger.registerTask("Setup Fuzzy Finder");

        try {
            taskLogger.startTask(taskId);
            taskLogger.finishTask(taskId);
        } catch {
            taskLogger.failTask(taskId);
        }
    }
}
