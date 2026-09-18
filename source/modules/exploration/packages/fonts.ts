import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Package } from "../package";
import { Task } from "../task";
import type { TaskLogger } from "../task-logger";

export class Fonts implements Package {
    systemDependencyNames = ["fontconfig"];

    async postSystemInstall(logger: TaskLogger): Promise<void> {
        const task = new Task("Setup Fonts");
        logger.add(task);
        task.start();

        try {
            const fontsDirectoryPath = path.join(import.meta.dirname, "assets", "fonts");
            const systemFontsDirectoryPath = path.join(os.homedir(), ".local", "share", "fonts");
            task.continue("Create fonts directory");
            await fs.mkdir(systemFontsDirectoryPath, { recursive: true });
            task.continue("Copy fonts");
            await fs.cp(fontsDirectoryPath, systemFontsDirectoryPath, { recursive: true });
            task.finish();
        } catch (error) {
            task.fail(error);
        }
    }
}
