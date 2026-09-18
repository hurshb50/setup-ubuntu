#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import { name, version } from "../package.json";
import { Logger } from "./modules/exploration/logger";
import { PackageManager } from "./modules/exploration/package-manager";
import path from "path";
import os from "os";
import type { Package } from "./modules/exploration/new-package";
import { Wallpapers } from "./modules/exploration/packages/wallpapers";
import { Task } from "./modules/exploration/task";

program
    .name(name)
    .version(version)
    .description("TODO")
    .action(async () => {
        const logger = new Logger();
        const packageManager = new PackageManager();
        logger.start();

        const packages: Package[] = [new Wallpapers()];

        try {
            const packageManagerUpdateTask = new Task("Update package manager");
            logger.add(packageManagerUpdateTask);
            packageManagerUpdateTask.start();
            await packageManager.update();
            packageManagerUpdateTask.finish();

            const directories = {
                current: import.meta.dirname,
                assets: path.join(import.meta.dirname, "assets"),
                home: os.homedir(),
            };

            const installationCalls = packages.map(({ install }) => install({ directories, logger, packageManager }));
            await Promise.all(installationCalls);
        } finally {
            logger.stop();
        }
    });

program.parse();
