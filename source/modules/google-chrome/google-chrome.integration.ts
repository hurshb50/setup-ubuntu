import fs from "fs/promises";
import os from "os";
import path from "path";
import util from "util";
import childProcess from "child_process";
import { beforeAll, expect, suite, test } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { Task } from "../task/task";
import { pathExists } from "../test/integration/file-system";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { GoogleChrome } from "./google-chrome";

suite("Google Chrome", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    const keyringFilePath = "/usr/share/keyrings/google-chrome.gpg";
    const sourceFilePath = "/etc/apt/sources.list.d/google-chrome.list";
    const userDataPath = path.join(os.homedir(), ".config", "google-chrome");

    // Mirrors how earlier releases installed Chrome.
    beforeAll(async () => {
        const task = new Task("Install Google Chrome");
        task.start();

        const exec = util.promisify(childProcess.exec);

        await exec(
            `curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | sudo gpg --dearmor --yes -o ${keyringFilePath}`,
        );

        await exec(
            `echo 'deb [arch=amd64 signed-by=${keyringFilePath}] http://dl.google.com/linux/chrome/deb/ stable main' | sudo tee ${sourceFilePath} > /dev/null`,
        );

        await context.dependencyManager.update(task);
        await context.dependencyManager.install(["google-chrome-stable"], task);
        await fs.mkdir(userDataPath, { recursive: true });
    });

    test("reports google chrome as installed", async () => {
        expect(await new GoogleChrome().isInstalled(context)).toBe(true);
    });

    suite("uninstall", () => {
        beforeAll(async () => {
            await new GoogleChrome().uninstall(context);
        });

        test("removes google chrome", async () => {
            expect(await context.dependencyManager.isInstalled(["google-chrome-stable"])).toBe(false);
            expect(await new GoogleChrome().isInstalled(context)).toBe(false);
        });

        test("removes the google chrome sources", async () => {
            expect(await pathExists(keyringFilePath)).toBe(false);
            expect(await pathExists(sourceFilePath)).toBe(false);
        });

        test("removes the user data", async () => {
            expect(await pathExists(userDataPath)).toBe(false);
        });
    });
});
