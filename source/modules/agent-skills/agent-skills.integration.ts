import fs from "fs/promises";
import os from "os";
import path from "path";
import { afterAll, beforeAll, expect, suite, test } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { AgentSkills } from "./agent-skills";

suite("Agent Skills", () => {
    let homeDirectoryPath = "";
    const context = {
        dependencyManager: new DependencyManager(),
        directories: {
            assets: assetsDirectoryPath,
            current: projectDirectoryPath,
            get home() {
                return homeDirectoryPath;
            },
        },
        logger: new Logger(),
    };

    beforeAll(async () => {
        homeDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), "agent-skills-"));
        const staleSkillDirectoryPath = path.join(homeDirectoryPath, ".agents", "skills", "stale-skill");
        await fs.mkdir(staleSkillDirectoryPath, { recursive: true });
        await fs.writeFile(path.join(staleSkillDirectoryPath, "SKILL.md"), "stale");
        await new AgentSkills().install(context);
    });

    afterAll(async () => {
        await fs.rm(homeDirectoryPath, { recursive: true, force: true });
    });

    test("copies the agent skills into the global skills directory", async () => {
        const sourceDirectoryPath = path.join(assetsDirectoryPath, "skills");
        const destinationDirectoryPath = path.join(homeDirectoryPath, ".agents", "skills");
        const sourceDirectoryNames = (await fs.readdir(sourceDirectoryPath)).sort();
        const destinationDirectoryNames = (await fs.readdir(destinationDirectoryPath)).sort();

        expect(destinationDirectoryNames).toEqual(sourceDirectoryNames);
        expect(destinationDirectoryNames).not.toContain("stale-skill");

        for (const directoryName of sourceDirectoryNames) {
            const sourceSkillPath = path.join(sourceDirectoryPath, directoryName, "SKILL.md");
            const destinationSkillPath = path.join(destinationDirectoryPath, directoryName, "SKILL.md");

            expect(await fs.readFile(destinationSkillPath, "utf8")).toBe(await fs.readFile(sourceSkillPath, "utf8"));
        }
    });
});
