import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Package } from "../package";
import { Task } from "../task";
import type { Logger } from "../t../logger

export class Fonts implements Package {
    systemDependencyNames = ["fontconfig"];

    async postSystemInstall(logger: Logger): Promise<void> {
        const task = new Task("Setup Fonts");
        logger.add(task);
        task.start();

        const fontsDirectoryPath = path.join(import.meta.dirname, "assets", "fonts");
        const systemFontsDirectoryPath = path.join(os.homedir(), ".local", "share", "fonts");
        task.continue("Create fonts directory");
        await fs.mkdir(systemFontsDirectoryPath, { recursive: true });
        task.continue("Copy fonts");
        await fs.cp(fontsDirectoryPath, systemFontsDirectoryPath, { recursive: true });
        task.finish();
    }
}
