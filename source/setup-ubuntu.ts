#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import os from "os";
import path from "path";
import { name, version } from "../package.json";
import { Logger } from "./modules/exploration/logger";
import type { Package } from "./modules/exploration/package";
import { DependencyManager } from "./modules/exploration/dependency-manager";
import { AgentRules } from "./modules/exploration/packages/agent-rules";
import { AgentSkills } from "./modules/exploration/packages/agent-skills";
import { AutoSuggestion } from "./modules/exploration/packages/auto-suggestion";
import { Browser } from "./modules/exploration/packages/browser";
import { CodeEditor } from "./modules/exploration/packages/code-editor";
import { ContainerEngine } from "./modules/exploration/packages/container-engine";
import { Fonts } from "./modules/exploration/packages/fonts";
import { FuzzyFinder } from "./modules/exploration/packages/fuzzy-finder";
import { PasswordManager } from "./modules/exploration/packages/password-manager";
import { ShellConfiguration } from "./modules/exploration/packages/shell-configuration";
import { SmartChangeDirectory } from "./modules/exploration/packages/smart-change-directory";
import { TerminalView } from "./modules/exploration/packages/terminal-view";
import { VersionControlSystem } from "./modules/exploration/packages/version-control-system";
import { Wallpapers } from "./modules/exploration/packages/wallpapers";

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
