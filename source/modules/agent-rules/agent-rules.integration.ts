import fs from "fs/promises";
import os from "os";
import path from "path";
import { beforeAll, expect, suite, test } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { AgentRules } from "./agent-rules";

suite("Agent Rules", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    beforeAll(async () => {
        await new AgentRules().install(context);
    });

    test("copies the agent rules into the configuration directory", async () => {
        const sourceFilePath = path.join(assetsDirectoryPath, "AGENTS.md");
        const destinationFilePath = path.join(os.homedir(), ".config", "zed", "AGENTS.md");

        expect(await fs.readFile(destinationFilePath, "utf8")).toBe(await fs.readFile(sourceFilePath, "utf8"));
    });
});
