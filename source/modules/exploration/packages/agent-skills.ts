import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Package } from "../package";
import type { TaskLogger } from "../task-logger";

export class AgentSkills implements Package {
    async postSystemInstall(taskLogger: TaskLogger): Promise<void> {
        const taskId = taskLogger.registerTask("Setup Agent Skills");

        try {
            taskLogger.startTask(taskId);

            const homeDirectoryPath = os.homedir();
            const globalSkillsDirectoryPath = path.join(homeDirectoryPath, ".agents", "skills");
            const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
            const skillsDirectoryPath = path.join(assetsDirectoryPath, "skills");

            taskLogger.updateTaskStep(taskId, "Create global skills directory");
            await fs.mkdir(globalSkillsDirectoryPath, { recursive: true });

            taskLogger.updateTaskStep(taskId, "Copy agent skills");
            await fs.cp(skillsDirectoryPath, globalSkillsDirectoryPath, { recursive: true });

            taskLogger.finishTask(taskId);
        } catch {
            taskLogger.failTask(taskId);
        }
    }
}
