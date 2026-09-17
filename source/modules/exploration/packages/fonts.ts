import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Package } from "../package";
import type { TaskLogger } from "../task-logger";

export class Fonts implements Package {
    systemDependencyNames = ["fontconfig"];

    async postSystemInstall(taskLogger: TaskLogger): Promise<void> {
        const taskId = taskLogger.registerTask("Setup Fonts");

        try {
            taskLogger.startTask(taskId);
            const fontsDirectoryPath = path.join(import.meta.dirname, "assets", "fonts");
            const systemFontsDirectoryPath = path.join(os.homedir(), ".local", "share", "fonts");
            taskLogger.updateTaskStep(taskId, "Create fonts directory");
            await fs.mkdir(systemFontsDirectoryPath, { recursive: true });
            taskLogger.updateTaskStep(taskId, "Copy fonts");
            await fs.cp(fontsDirectoryPath, systemFontsDirectoryPath, { recursive: true });
            taskLogger.finishTask(taskId);
        } catch {
            taskLogger.failTask(taskId);
        }
    }
}
