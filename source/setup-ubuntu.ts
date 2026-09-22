#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import os from "os";
import path from "path";
import { name, version } from "../package.json";
import { Logger } from "./modules/logger/logger";
import type { Package } from "./modules/package/package";
import { DependencyManager } from "./modules/dependency-manager/dependency-manager";
import { AgentRules } from "./modules/agent-rules/agent-rules";
import { AgentSkills } from "./modules/agent-skills/agent-skills";
import { AutoSuggestion } from "./modules/auto-suggestion/auto-suggestion";
import { Browser } from "./modules/browser/browser";
import { CodeEditor } from "./modules/code-editor/code-editor";
import { CodeHost } from "./modules/code-host/code-host";
import { ContainerEngine } from "./modules/container-engine/container-engine";
import { Fonts } from "./modules/fonts/fonts";
import { FuzzyFinder } from "./modules/fuzzy-finder/fuzzy-finder";
import { PasswordManager } from "./modules/password-manager/password-manager";
import { ShellConfiguration } from "./modules/shell-configuration/shell-configuration";
import { SmartChangeDirectory } from "./modules/smart-change-directory/smart-change-directory";
import { TerminalView } from "./modules/terminal-view/terminal-view";
import { VersionControlSystem } from "./modules/version-control-system/version-control-system";
import { Wallpapers } from "./modules/wallpapers/wallpapers";

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
