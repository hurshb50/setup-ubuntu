#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import os from "os";
import path from "path";
import { name, version } from "../package.json";
import { Logger } from "./modules/logger";
import type { Package } from "./modules/package";
import { DependencyManager } from "./modules/dependency-manager";
import { AgentRules } from "./modules/packages/agent-rules";
import { AgentSkills } from "./modules/packages/agent-skills";
import { AutoSuggestion } from "./modules/packages/auto-suggestion";
import { Browser } from "./modules/packages/browser";
import { CodeEditor } from "./modules/packages/code-editor";
import { CodeHost } from "./modules/packages/code-host";
import { ContainerEngine } from "./modules/packages/container-engine";
import { Fonts } from "./modules/packages/fonts";
import { FuzzyFinder } from "./modules/packages/fuzzy-finder";
import { PasswordManager } from "./modules/packages/password-manager";
import { ShellConfiguration } from "./modules/packages/shell-configuration";
import { SmartChangeDirectory } from "./modules/packages/smart-change-directory";
import { TerminalView } from "./modules/packages/terminal-view";
import { VersionControlSystem } from "./modules/packages/version-control-system";
import { Wallpapers } from "./modules/packages/wallpapers";

program
    .name(name)
    .version(version)
    .description("TODO")
    .action(async () => {
        const logger = new Logger();
        const dependencyManager = new DependencyManager();
        logger.start();

        const packages: Package[] = [
            new AgentRules(),
            new AgentSkills(),
            new AutoSuggestion(),
            new Browser(),
            new CodeEditor(),
            new CodeHost(),
            new ContainerEngine(),
            new Fonts(),
            new FuzzyFinder(),
            new PasswordManager(),
            new ShellConfiguration(),
            new SmartChangeDirectory(),
            new TerminalView(),
            new VersionControlSystem(),
            new Wallpapers(),
        ];

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
