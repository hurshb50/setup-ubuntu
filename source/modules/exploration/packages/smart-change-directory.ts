import type { Package } from "../package";
import type { TaskLogger } from "../task-logger";
import { execAsync } from "../../exec-async";

export class SmartChangeDirectory implements Package {
    async postSystemInstall(taskLogger: TaskLogger): Promise<void> {
        const taskId = taskLogger.registerTask("Setup Smart Change Directory");

        try {
            taskLogger.startTask(taskId);
            taskLogger.updateTaskStep(taskId, "Install zoxide");
            await execAsync("curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh");
            taskLogger.finishTask(taskId);
        } catch {
            taskLogger.failTask(taskId);
        }
    }
}
