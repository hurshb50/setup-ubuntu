import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Package } from "../package";
import { Task } from "../task";
import type { Logger } from "../logger";

export class AgentSkills implements Package {
    async postSystemInstall(logger: Logger): Promise<void> {
        const task = new Task("Setup Agent Skills");
        logger.add(task);
        task.start();

        const homeDirectoryPath = os.homedir();
        const globalSkillsDirectoryPath = path.join(homeDirectoryPath, ".agents", "skills");
        const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
        const skillsDirectoryPath = path.join(assetsDirectoryPath, "skills");

        task.continue("Create global skills directory");
        await fs.mkdir(globalSkillsDirectoryPath, { recursive: true });

        task.continue("Copy agent skills");
        await fs.cp(skillsDirectoryPath, globalSkillsDirectoryPath, { recursive: true });

        task.finish();
    }
}
