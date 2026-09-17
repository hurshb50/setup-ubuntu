import type { Package } from "../package";
import type { TaskLogger } from "../task-logger";
import { execAsync } from "../../exec-async";

export class Browser implements Package {
    systemDependencyNames = ["gnupg"];
    systemName = "google-chrome-stable";

    async setupSystemSources(): Promise<void> {
        await execAsync(
            "curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | sudo gpg --dearmor --yes -o /usr/share/keyrings/google-chrome.gpg",
        );

        await execAsync(
            "echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main' | sudo tee /etc/apt/sources.list.d/google-chrome.list > /dev/null",
        );
    }

    async postSystemInstall(taskLogger: TaskLogger): Promise<void> {
        const taskId = taskLogger.registerTask("Setup Browser");

        try {
            taskLogger.startTask(taskId);
            taskLogger.finishTask(taskId);
        } catch {
            taskLogger.failTask(taskId);
        }
    }
}
