import fs from "fs/promises";
import path from "path";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

const dependencies = ["git", "git-lfs", "build-essential"];

export class VersionControlSystem implements Package {
    async isInstalled(context: InstallContext): Promise<boolean> {
        return context.dependencyManager.isInstalled(dependencies);
    }

    async install(context: InstallContext): Promise<void> {
        const task = new Task("Version Control System");
        context.logger.add(task);
        task.start();

        const isInstalled = await this.isInstalled(context);

        if (!isInstalled) {
            task.continue("Update package manager");
            await context.dependencyManager.update(task);

            task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
            await context.dependencyManager.install(dependencies, task);
        }

        const sourceFilePath = path.join(context.directories.assets, ".gitconfig");
        const destinationFilePath = path.join(context.directories.home, ".gitconfig");

        task.continue("Copy configuration");
        const sourceConfiguration = await fs.readFile(sourceFilePath, "utf8");
        let existingConfiguration = "";

        try {
            existingConfiguration = await fs.readFile(destinationFilePath, "utf8");
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        }

        const userConfigurations: string[] = [];
        let currentSection: string[] = [];
        let preserveCurrentSection = false;

        for (const line of existingConfiguration.match(/[^\r\n]*(?:\r?\n|$)/g) ?? []) {
            if (/^[ \t]*\[/.test(line)) {
                if (preserveCurrentSection) userConfigurations.push(currentSection.join(""));

                const sectionName = line.match(/^[ \t]*\[([^\s\]]+)/)?.[1];
                preserveCurrentSection = sectionName?.toLowerCase() === "user";
                currentSection = preserveCurrentSection ? [line] : [];
            } else if (preserveCurrentSection) {
                currentSection.push(line);
            }
        }

        if (preserveCurrentSection) userConfigurations.push(currentSection.join(""));

        const configuration = [...userConfigurations.map((value) => value.trim()), sourceConfiguration.trimEnd()]
            .filter(Boolean)
            .join("\n\n");

        await fs.writeFile(destinationFilePath, `${configuration}\n`);

        task.continue("Copy identity profiles");
        const profilesDirectoryPath = path.join(context.directories.home, ".config", "git");
        await fs.mkdir(profilesDirectoryPath, { recursive: true });

        for (const fileName of ["work.gitconfig", "personal.gitconfig"]) {
            await fs.copyFile(
                path.join(context.directories.assets, "git", fileName),
                path.join(profilesDirectoryPath, fileName),
            );
        }

        task.finish();
    }
}
