import fs from "fs/promises";
import os from "os";
import path from "path";
import { beforeAll, expect, suite, test } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { AgentSkills } from "./agent-skills";

suite("Agent Skills", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    beforeAll(async () => {
        await new AgentSkills().install(context);
    });

    test("copies the agent skills into the global skills directory", async () => {
        const sourceDirectoryPath = path.join(assetsDirectoryPath, "skills");
        const destinationDirectoryPath = path.join(os.homedir(), ".agents", "skills");
        const sourceDirectoryNames = (await fs.readdir(sourceDirectoryPath)).sort();
        const destinationDirectoryNames = (await fs.readdir(destinationDirectoryPath)).sort();

        expect(destinationDirectoryNames).toEqual(sourceDirectoryNames);

        for (const directoryName of sourceDirectoryNames) {
            const sourceSkillPath = path.join(sourceDirectoryPath, directoryName, "SKILL.md");
            const destinationSkillPath = path.join(destinationDirectoryPath, directoryName, "SKILL.md");

            expect(await fs.readFile(destinationSkillPath, "utf8")).toBe(await fs.readFile(sourceSkillPath, "utf8"));
        }
    });
});
