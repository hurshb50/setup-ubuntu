#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import { name, version } from "../package.json";
// import { installVersionControlSystem } from "./modules/version-control-system";
// import { updateSystemPackageManager } from "./modules/system-package-manager";
// import { installContainerEngine } from "./modules/container-engine";
// import { installTerminalView } from "./modules/terminal-view";
// import { installFonts } from "./modules/fonts";
// import { installFuzzyFinder } from "./modules/fuzzy-finder";
// import { installAutoSuggestion } from "./modules/auto-suggestion";
// import { installSmartChangeDirectory } from "./modules/smart-change-directory";
// import { installCodeEditor } from "./modules/code-editor";
// import { installBrowser } from "./modules/browser";
// import { installPasswordManager } from "./modules/password-manager";
// import { installWallpapers } from "./modules/wallpapers";
// import { installAgentRules } from "./modules/agent-rules";
// import { installAgentSkills } from "./modules/agent-skills";
// import { installShellConfiguration } from "./modules/shell-configuration";
import { TaskLogger } from "./modules/process/task-logger";

program
    .name(name)
    .version(version)
    .description("TODO")
    .action(async () => {
        const logger = new TaskLogger();

        const taskAId = logger.registerTask({ name: "Example A", header: "Install Example A" });
        const taskBId = logger.registerTask({ name: "Example B", header: "Install Example B" });

        logger.start();

        await new Promise((resolve) => setTimeout(resolve, 5000));

        logger.startTask(taskAId);
        logger.updateTaskStep(taskAId, "Doing something important");

        await new Promise((resolve) => setTimeout(resolve, 5000));

        logger.startTask(taskBId);
        logger.updateTaskStep(taskBId, "Less important");

        await new Promise((resolve) => setTimeout(resolve, 5000));

        logger.finishTask(taskAId);

        await new Promise((resolve) => setTimeout(resolve, 5000));

        logger.finishTask(taskBId);

        await new Promise((resolve) => setTimeout(resolve, 5000));

        logger.stop();

        // await updateSystemPackageManager();
        // await installAgentRules();
        // await installAgentSkills();
        // await installAutoSuggestion();
        // await installBrowser();
        // await installCodeEditor();
        // await installContainerEngine();
        // await installFuzzyFinder();
        // await installFonts();
        // await installPasswordManager();
        // await installShellConfiguration();
        // await installSmartChangeDirectory();
        // await installTerminalView();
        // await installVersionControlSystem();
        // await installWallpapers();
    });

program.parse();
