#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import os from "os";
import path from "path";
import { name, version } from "../package.json";
import { Logger } from "./modules/exploration/logger";
import type { Package } from "./modules/exploration/package";
import { DependencyManager } from "./modules/exploration/dependency-manager";
import { Wallpapers } from "./modules/exploration/packages/wallpapers";
import { VersionControlSystem } from "./modules/exploration/packages/version-control-system";

program
    .name(name)
    .version(version)
    .description("TODO")
    .action(async () => {
        const logger = new Logger();
        const dependencyManager = new DependencyManager();
        logger.start();

        const packages: Package[] = [new VersionControlSystem()];

        try {
            const directories = {
                current: import.meta.dirname,
                assets: path.join(import.meta.dirname, "assets"),
                home: os.homedir(),
            };

            const installations = packages.map(({ install }) => install({ dependencyManager, directories, logger }));
            await Promise.all(installations);
        } finally {
            logger.stop();
        }
    });

program.parse();
