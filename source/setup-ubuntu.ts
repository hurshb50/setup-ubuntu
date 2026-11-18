#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import os from "os";
import path from "path";
import { name, version } from "../package.json";
import { Logger } from "./modules/logger/logger";
import type { InstallContext, LegacyPackage } from "./modules/package/package";
import { selectPackages, type PackageOption } from "./modules/package-selection/package-selection";
import { DependencyManager } from "./modules/dependency-manager/dependency-manager";
import { AgentRules } from "./modules/agent-rules/agent-rules";
import { AgentSkills } from "./modules/agent-skills/agent-skills";
import { AptZoxide } from "./modules/apt-zoxide/apt-zoxide";
import { AutoSuggestion } from "./modules/auto-suggestion/auto-suggestion";
import { Browser } from "./modules/browser/browser";
import { Clipboard } from "./modules/clipboard/clipboard";
import { CodeEditor } from "./modules/code-editor/code-editor";
import { CodeHost } from "./modules/code-host/code-host";
import { ContainerEngine } from "./modules/container-engine/container-engine";
import { Fonts } from "./modules/fonts/fonts";
import { FuzzyFinder } from "./modules/fuzzy-finder/fuzzy-finder";
import { GoogleChrome } from "./modules/google-chrome/google-chrome";
import { PasswordManager } from "./modules/password-manager/password-manager";
import { ShellConfiguration } from "./modules/shell-configuration/shell-configuration";
import { SmartChangeDirectory } from "./modules/smart-change-directory/smart-change-directory";
import { TerminalView } from "./modules/terminal-view/terminal-view";
import { VersionControlSystem } from "./modules/version-control-system/version-control-system";
import { Wallpapers } from "./modules/wallpapers/wallpapers";

program
    .name(name)
    .version(version)
    .description("Sets up a fresh Ubuntu machine with a standard set of tools, configuration, and dotfiles.")
    .action(async () => {
        const packages: PackageOption[] = [
            { label: "Agent Rules", implementation: new AgentRules() },
            { label: "Agent Skills", implementation: new AgentSkills() },
            { label: "Auto Suggestion", implementation: new AutoSuggestion() },
            { label: "Browser", implementation: new Browser() },
            { label: "Clipboard", implementation: new Clipboard() },
            { label: "Code Editor", implementation: new CodeEditor() },
            { label: "Code Host", implementation: new CodeHost() },
            { label: "Container Engine", implementation: new ContainerEngine() },
            { label: "Fonts", implementation: new Fonts() },
            { label: "Fuzzy Finder", implementation: new FuzzyFinder() },
            { label: "Password Manager", implementation: new PasswordManager() },
            { label: "Shell Configuration", implementation: new ShellConfiguration() },
            { label: "Smart Change Directory", implementation: new SmartChangeDirectory() },
            { label: "Terminal View", implementation: new TerminalView() },
            { label: "Version Control System", implementation: new VersionControlSystem() },
            { label: "Wallpapers", implementation: new Wallpapers() },
        ];

        const legacyPackages: LegacyPackage[] = [new GoogleChrome(), new AptZoxide()];

        const context: InstallContext = {
            dependencyManager: new DependencyManager(),
            directories: {
                current: import.meta.dirname,
                assets: path.join(import.meta.dirname, "assets"),
                home: os.homedir(),
            },
            logger: new Logger(),
        };

        const selection = await selectPackages(packages, context);
        if (selection === undefined) return;

        const legacyInstalled = await Promise.all(legacyPackages.map((entry) => entry.isInstalled(context)));
        const installedLegacyPackages = legacyPackages.filter((_, index) => legacyInstalled[index]);
        const uninstallations = [...installedLegacyPackages, ...selection.uninstall];

        if (uninstallations.length === 0 && selection.install.length === 0) {
            process.stdout.write("No components selected. Nothing to do.\n");
            return;
        }

        await context.dependencyManager.authenticate();
        context.logger.start();

        try {
            // Removals run first so a removed tool cannot undo a fresh installation.
            await Promise.all(uninstallations.map((entry) => entry.uninstall(context)));
            await Promise.all(selection.install.map((entry) => entry.install(context)));
        } finally {
            context.logger.stop();
        }
    });

program.parse();
