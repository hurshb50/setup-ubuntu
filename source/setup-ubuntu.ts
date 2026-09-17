#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import { name, version } from "../package.json";
import type { Package } from "./modules/exploration/package";
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
import { SystemPackageManager } from "./modules/exploration/system-package-manager";
import { TaskLogger } from "./modules/exploration/task-logger";

program
    .name(name)
    .version(version)
    .description("TODO")
    .action(async () => {
        const packages: Package[] = [
            new VersionControlSystem(),
            new FuzzyFinder(),
            new AgentRules(),
            new AgentSkills(),
            new AutoSuggestion(),
            new Browser(),
            new CodeEditor(),
            new ContainerEngine(),
            new Fonts(),
            new PasswordManager(),
            new SmartChangeDirectory(),
            new TerminalView(),
            new Wallpapers(),
        ];

        const taskLogger = new TaskLogger(80);
        const systemPackageManager = new SystemPackageManager(packages, taskLogger);
        taskLogger.start();
        systemPackageManager.installPrequisites();
        // await systemPackageManager.setupSources();
        // systemPackageManager.updateSystemPackageManager();
        // systemPackageManager.installPackages();
        // await systemPackageManager.postSystemInstall();
        // await new ShellConfiguration().postSystemInstall(taskLogger);
        taskLogger.stop();
    });

program.parse();
