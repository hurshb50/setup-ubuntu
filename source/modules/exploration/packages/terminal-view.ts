import type { Package } from "../package";
import type { TaskLogger } from "../task-logger";
import { execAsync } from "../../exec-async";

export class TerminalView implements Package {
    systemDependencyNames = ["unzip"];

    async postSystemInstall(taskLogger: TaskLogger): Promise<void> {
        const taskId = taskLogger.registerTask("Setup Terminal View");

        try {
            taskLogger.startTask(taskId);
            taskLogger.updateTaskStep(taskId, "Install oh-my-posh");
            await execAsync("curl -s https://ohmyposh.dev/install.sh | bash -s");
            taskLogger.finishTask(taskId);
        } catch {
            taskLogger.failTask(taskId);
        }
    }
}
