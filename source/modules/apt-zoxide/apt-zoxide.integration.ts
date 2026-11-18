import os from "os";
import { beforeAll, expect, suite, test } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { Task } from "../task/task";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { AptZoxide } from "./apt-zoxide";

suite("zoxide (apt)", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    beforeAll(async () => {
        const task = new Task("Install zoxide (apt)");
        task.start();

        await context.dependencyManager.update(task);
        await context.dependencyManager.install(["zoxide"], task);
    });

    test("reports the apt version of zoxide as installed", async () => {
        expect(await new AptZoxide().isInstalled(context)).toBe(true);
    });

    suite("uninstall", () => {
        beforeAll(async () => {
            await new AptZoxide().uninstall(context);
        });

        test("removes the apt version of zoxide", async () => {
            expect(await new AptZoxide().isInstalled(context)).toBe(false);
        });
    });
});
